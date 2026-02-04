from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.deps import get_publisher, get_current_active_user, get_admin
from app.models.ad_space import AdSpace, AdSpaceStatus
from app.models.campaign import PlatformType
from app.models.user import User
from app.schemas.ad_space import AdSpaceCreate, AdSpaceUpdate, AdSpaceResponse

router = APIRouter(prefix="/ad-spaces", tags=["Ad Spaces"])


@router.post("/", response_model=AdSpaceResponse, status_code=status.HTTP_201_CREATED)
def create_ad_space(
    ad_space_data: AdSpaceCreate,
    current_user: User = Depends(get_publisher),
    db: Session = Depends(get_db)
):
    ad_space = AdSpace(
        user_id=current_user.id,
        name=ad_space_data.name,
        platform_type=ad_space_data.platform_type,
        description=ad_space_data.description,
        url=str(ad_space_data.url) if ad_space_data.url else None,
        price_per_view=ad_space_data.price_per_view,
        price_per_click=ad_space_data.price_per_click,
        status=AdSpaceStatus.ACTIVE
    )
    
    db.add(ad_space)
    db.commit()
    db.refresh(ad_space)
    
    return ad_space


@router.get("/", response_model=List[AdSpaceResponse])
def list_ad_spaces(
    platform_type: PlatformType = None,
    status: AdSpaceStatus = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    query = db.query(AdSpace)
    
    if current_user.role.value == "publisher":
        query = query.filter(AdSpace.user_id == current_user.id)
    elif current_user.role.value == "advertiser":
        query = query.filter(AdSpace.status == AdSpaceStatus.ACTIVE)
    
    if platform_type:
        query = query.filter(AdSpace.platform_type == platform_type)
    
    if status:
        query = query.filter(AdSpace.status == status)
    
    ad_spaces = query.order_by(AdSpace.created_at.desc()).all()
    return ad_spaces


@router.get("/{ad_space_id}", response_model=AdSpaceResponse)
def get_ad_space(
    ad_space_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    ad_space = db.query(AdSpace).filter(AdSpace.id == ad_space_id).first()
    
    if not ad_space:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ad space not found"
        )
    
    if current_user.role.value == "publisher" and ad_space.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    return ad_space


@router.put("/{ad_space_id}", response_model=AdSpaceResponse)
def update_ad_space(
    ad_space_id: int,
    ad_space_data: AdSpaceUpdate,
    current_user: User = Depends(get_publisher),
    db: Session = Depends(get_db)
):
    ad_space = db.query(AdSpace).filter(AdSpace.id == ad_space_id).first()
    
    if not ad_space:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ad space not found"
        )
    
    if ad_space.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    update_data = ad_space_data.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        if key == "url" and value:
            value = str(value)
        setattr(ad_space, key, value)
    
    db.commit()
    db.refresh(ad_space)
    
    return ad_space
