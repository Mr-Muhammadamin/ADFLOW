from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime
import os
import uuid
from PIL import Image
from app.core.database import get_db
from app.core.deps import get_advertiser, get_current_active_user
from app.models.campaign import Campaign, CampaignView, CampaignClick, CampaignStatus
from app.models.ad_space import AdSpace
from app.schemas.campaign import CampaignCreate, CampaignUpdate, CampaignResponse, CampaignStats
from app.models.user import User

router = APIRouter(prefix="/campaigns", tags=["Campaigns"])


UPLOAD_DIR = "static/uploads"
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif"}
MAX_FILE_SIZE = 5 * 1024 * 1024


def save_banner(file: UploadFile) -> str:
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)
    
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Allowed: jpg, jpeg, png, gif"
        )
    
    filename = f"{uuid.uuid4()}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    
    with open(filepath, "wb") as buffer:
        content = file.file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File too large. Max 5MB"
            )
        buffer.write(content)
    
    img = Image.open(filepath)
    img.thumbnail((1200, 628))
    img.save(filepath)
    
    return f"/static/uploads/{filename}"


@router.post("/", response_model=CampaignResponse, status_code=status.HTTP_201_CREATED)
def create_campaign(
    campaign_data: CampaignCreate,
    current_user: User = Depends(get_advertiser),
    db: Session = Depends(get_db)
):
    if campaign_data.end_date <= campaign_data.start_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="End date must be after start date"
        )
    
    from app.models.wallet import Wallet
    wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
    
    if wallet.balance < campaign_data.total_budget:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient wallet balance"
        )
    
    campaign = Campaign(
        user_id=current_user.id,
        title=campaign_data.title,
        description=campaign_data.description,
        platform_type=campaign_data.platform_type,
        banner_url=campaign_data.banner_url,
        daily_budget=campaign_data.daily_budget,
        total_budget=campaign_data.total_budget,
        start_date=campaign_data.start_date,
        end_date=campaign_data.end_date,
        status=CampaignStatus.PENDING
    )
    
    db.add(campaign)
    db.commit()
    db.refresh(campaign)
    
    return campaign


@router.post("/upload-banner")
async def upload_banner(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user)
):
    banner_url = save_banner(file)
    return {"banner_url": banner_url}


@router.get("/", response_model=List[CampaignResponse])
def list_campaigns(
    status: CampaignStatus = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    query = db.query(Campaign)
    
    if current_user.role.value == "advertiser":
        query = query.filter(Campaign.user_id == current_user.id)
    
    if status:
        query = query.filter(Campaign.status == status)
    
    campaigns = query.order_by(Campaign.created_at.desc()).all()
    return campaigns


@router.get("/{campaign_id}", response_model=CampaignResponse)
def get_campaign(
    campaign_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found"
        )
    
    if current_user.role.value == "advertiser" and campaign.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    return campaign


@router.put("/{campaign_id}", response_model=CampaignResponse)
def update_campaign(
    campaign_id: int,
    campaign_data: CampaignUpdate,
    current_user: User = Depends(get_advertiser),
    db: Session = Depends(get_db)
):
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found"
        )
    
    if campaign.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    if campaign.status == CampaignStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot update active campaign"
        )
    
    update_data = campaign_data.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(campaign, key, value)
    
    db.commit()
    db.refresh(campaign)
    
    return campaign


@router.post("/{campaign_id}/pause", response_model=CampaignResponse)
def pause_campaign(
    campaign_id: int,
    current_user: User = Depends(get_advertiser),
    db: Session = Depends(get_db)
):
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    
    if not campaign or campaign.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found"
        )
    
    if campaign.status != CampaignStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only active campaigns can be paused"
        )
    
    campaign.status = CampaignStatus.PAUSED
    db.commit()
    db.refresh(campaign)
    
    return campaign


@router.post("/{campaign_id}/resume", response_model=CampaignResponse)
def resume_campaign(
    campaign_id: int,
    current_user: User = Depends(get_advertiser),
    db: Session = Depends(get_db)
):
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    
    if not campaign or campaign.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found"
        )
    
    if campaign.status != CampaignStatus.PAUSED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only paused campaigns can be resumed"
        )
    
    campaign.status = CampaignStatus.ACTIVE
    db.commit()
    db.refresh(campaign)
    
    return campaign


@router.get("/{campaign_id}/stats", response_model=CampaignStats)
def get_campaign_stats(
    campaign_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found"
        )
    
    if current_user.role.value == "advertiser" and campaign.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    ctr = 0.0
    if campaign.total_views > 0:
        ctr = (campaign.total_clicks / campaign.total_views) * 100
    
    return CampaignStats(
        total_views=campaign.total_views,
        total_clicks=campaign.total_clicks,
        ctr=round(ctr, 2),
        total_spend=campaign.total_spend
    )


@router.post("/{campaign_id}/activate", response_model=CampaignResponse)
def activate_campaign(
    campaign_id: int,
    current_user: User = Depends(get_advertiser),
    db: Session = Depends(get_db)
):
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    
    if not campaign or campaign.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found"
        )
    
    if campaign.status != CampaignStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only pending campaigns can be activated"
        )
    
    campaign.status = CampaignStatus.ACTIVE
    db.commit()
    db.refresh(campaign)
    
    return campaign


@router.get("/available/{platform_type}", response_model=List[CampaignResponse])
def get_available_campaigns(
    platform_type: str,
    db: Session = Depends(get_db)
):
    campaigns = db.query(Campaign).filter(
        Campaign.status == CampaignStatus.ACTIVE,
        Campaign.platform_type == platform_type
    ).all()
    
    return campaigns
