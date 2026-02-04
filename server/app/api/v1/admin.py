from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.deps import get_admin
from app.models.user import User
from app.models.campaign import Campaign
from app.models.ad_space import AdSpace
from app.models.wallet import Wallet, Withdrawal, TransactionStatus
from app.schemas.user import UserResponse
from app.schemas.wallet import WithdrawalResponse
from sqlalchemy import func

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/users", response_model=List[UserResponse])
def list_all_users(
    current_admin: User = Depends(get_admin),
    db: Session = Depends(get_db)
):
    users = db.query(User).order_by(User.created_at.desc()).all()
    return users


@router.get("/stats")
def get_global_stats(
    current_admin: User = Depends(get_admin),
    db: Session = Depends(get_db)
):
    total_users = db.query(User).count()
    total_advertisers = db.query(User).filter(User.role.value == "advertiser").count()
    total_publishers = db.query(User).filter(User.role.value == "publisher").count()
    
    total_campaigns = db.query(Campaign).count()
    active_campaigns = db.query(Campaign).filter(Campaign.status.value == "active").count()
    
    total_ad_spaces = db.query(AdSpace).count()
    
    total_spend = db.query(func.sum(Campaign.total_spend)).scalar() or 0
    total_earnings = db.query(func.sum(AdSpace.total_earnings)).scalar() or 0
    
    return {
        "total_users": total_users,
        "total_advertisers": total_advertisers,
        "total_publishers": total_publishers,
        "total_campaigns": total_campaigns,
        "active_campaigns": active_campaigns,
        "total_ad_spaces": total_ad_spaces,
        "total_spend": round(total_spend, 2),
        "total_earnings": round(total_earnings, 2)
    }


@router.post("/users/{user_id}/block")
def block_user(
    user_id: int,
    current_admin: User = Depends(get_admin),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user.id == current_admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot block yourself"
        )
    
    user.is_blocked = True
    user.is_active = False
    db.commit()
    
    return {"status": "success", "message": f"User {user.username} has been blocked"}


@router.post("/users/{user_id}/unblock")
def unblock_user(
    user_id: int,
    current_admin: User = Depends(get_admin),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.is_blocked = False
    user.is_active = True
    db.commit()
    
    return {"status": "success", "message": f"User {user.username} has been unblocked"}


@router.get("/campaigns/pending")
def get_pending_campaigns(
    current_admin: User = Depends(get_admin),
    db: Session = Depends(get_db)
):
    from app.models.campaign import CampaignStatus
    from app.schemas.campaign import CampaignResponse
    
    campaigns = db.query(Campaign).filter(
        Campaign.status == CampaignStatus.PENDING
    ).all()
    
    return campaigns


@router.post("/campaigns/{campaign_id}/approve")
def approve_campaign(
    campaign_id: int,
    current_admin: User = Depends(get_admin),
    db: Session = Depends(get_db)
):
    from app.models.campaign import CampaignStatus
    
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found"
        )
    
    campaign.status = CampaignStatus.ACTIVE
    db.commit()
    
    from app.models.notification import Notification
    notification = Notification(
        user_id=campaign.user_id,
        type="campaign_approved",
        title="Campaign Approved",
        message=f"Your campaign '{campaign.title}' has been approved and is now active",
        link=f"/campaigns/{campaign.id}"
    )
    db.add(notification)
    db.commit()
    
    return {"status": "success", "message": "Campaign approved"}


@router.post("/campaigns/{campaign_id}/reject")
def reject_campaign(
    campaign_id: int,
    reason: str,
    current_admin: User = Depends(get_admin),
    db: Session = Depends(get_db)
):
    from app.models.campaign import CampaignStatus
    
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found"
        )
    
    campaign.status = CampaignStatus.REJECTED
    db.commit()
    
    from app.models.notification import Notification
    notification = Notification(
        user_id=campaign.user_id,
        type="campaign_rejected",
        title="Campaign Rejected",
        message=f"Your campaign '{campaign.title}' has been rejected. Reason: {reason}",
        link=f"/campaigns/{campaign.id}"
    )
    db.add(notification)
    db.commit()
    
    return {"status": "success", "message": "Campaign rejected"}


@router.get("/withdrawals/pending", response_model=List[WithdrawalResponse])
def get_pending_withdrawals(
    current_admin: User = Depends(get_admin),
    db: Session = Depends(get_db)
):
    withdrawals = db.query(Withdrawal).filter(
        Withdrawal.status == TransactionStatus.PENDING
    ).all()
    
    return withdrawals


@router.post("/withdrawals/{withdrawal_id}/approve")
def approve_withdrawal(
    withdrawal_id: int,
    current_admin: User = Depends(get_admin),
    db: Session = Depends(get_db)
):
    withdrawal = db.query(Withdrawal).filter(Withdrawal.id == withdrawal_id).first()
    
    if not withdrawal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Withdrawal not found"
        )
    
    if withdrawal.status != TransactionStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Withdrawal is not pending"
        )
    
    withdrawal.status = TransactionStatus.COMPLETED
    
    transaction = db.query(Transaction).filter(
        Transaction.wallet_id == withdrawal.wallet_id,
        Transaction.transaction_type == "withdrawal",
        Transaction.amount == withdrawal.amount
    ).first()
    
    if transaction:
        transaction.status = TransactionStatus.COMPLETED
    
    db.commit()
    
    from app.models.notification import Notification
    wallet = db.query(Wallet).filter(Wallet.id == withdrawal.wallet_id).first()
    notification = Notification(
        user_id=wallet.user_id,
        type="withdrawal",
        title="Withdrawal Approved",
        message=f"Your withdrawal of ${withdrawal.amount} has been approved",
        link="/wallet/withdrawals"
    )
    db.add(notification)
    db.commit()
    
    return {"status": "success", "message": "Withdrawal approved"}


@router.post("/withdrawals/{withdrawal_id}/reject")
def reject_withdrawal(
    withdrawal_id: int,
    reason: str,
    current_admin: User = Depends(get_admin),
    db: Session = Depends(get_db)
):
    withdrawal = db.query(Withdrawal).filter(Withdrawal.id == withdrawal_id).first()
    
    if not withdrawal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Withdrawal not found"
        )
    
    if withdrawal.status != TransactionStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Withdrawal is not pending"
        )
    
    withdrawal.status = TransactionStatus.CANCELLED
    withdrawal.rejection_reason = reason
    
    wallet = db.query(Wallet).filter(Wallet.id == withdrawal.wallet_id).first()
    wallet.balance += withdrawal.amount
    
    transaction = db.query(Transaction).filter(
        Transaction.wallet_id == withdrawal.wallet_id,
        Transaction.transaction_type == "withdrawal",
        Transaction.amount == withdrawal.amount
    ).first()
    
    if transaction:
        transaction.status = TransactionStatus.CANCELLED
    
    db.commit()
    
    from app.models.notification import Notification
    notification = Notification(
        user_id=wallet.user_id,
        type="withdrawal",
        title="Withdrawal Rejected",
        message=f"Your withdrawal of ${withdrawal.amount} has been rejected. Reason: {reason}",
        link="/wallet/withdrawals"
    )
    db.add(notification)
    db.commit()
    
    return {"status": "success", "message": "Withdrawal rejected"}
