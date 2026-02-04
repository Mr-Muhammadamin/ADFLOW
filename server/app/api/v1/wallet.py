from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.deps import get_current_active_user
from app.models.wallet import Wallet, Transaction, Withdrawal, TransactionType, TransactionStatus
from app.models.user import User
from app.schemas.wallet import (
    WalletResponse,
    TransactionResponse,
    WithdrawalCreate,
    WithdrawalResponse,
    DepositResponse
)
from app.services.stripe_service import StripeService

router = APIRouter(prefix="/wallet", tags=["Wallet"])


@router.get("/", response_model=WalletResponse)
def get_wallet(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
    
    if not wallet:
        wallet = Wallet(user_id=current_user.id, balance=0.0)
        db.add(wallet)
        db.commit()
        db.refresh(wallet)
    
    return wallet


@router.get("/transactions", response_model=List[TransactionResponse])
def get_transactions(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
    
    if not wallet:
        return []
    
    transactions = db.query(Transaction).filter(
        Transaction.wallet_id == wallet.id
    ).order_by(Transaction.created_at.desc()).all()
    
    return transactions


@router.post("/deposit", response_model=DepositResponse)
def create_deposit(
    request: Request,
    amount: float,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    if amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Amount must be greater than 0"
        )
    
    wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
    if not wallet:
        wallet = Wallet(user_id=current_user.id, balance=0.0)
        db.add(wallet)
        db.commit()
    
    try:
        client_secret, payment_intent_id = StripeService.create_payment_intent(
            amount=amount,
            customer_id=current_user.stripe_customer_id
        )
        
        transaction = Transaction(
            wallet_id=wallet.id,
            transaction_type=TransactionType.DEPOSIT,
            amount=amount,
            status=TransactionStatus.PENDING,
            description=f"Deposit of ${amount}",
            stripe_payment_intent_id=payment_intent_id
        )
        db.add(transaction)
        db.commit()
        
        return DepositResponse(client_secret=client_secret, amount=amount)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Payment processing error: {str(e)}"
        )


@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    import stripe
    from app.core.config import settings
    
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    if event["type"] == "payment_intent.succeeded":
        payment_intent = event["data"]["object"]
        payment_intent_id = payment_intent["id"]
        
        transaction = db.query(Transaction).filter(
            Transaction.stripe_payment_intent_id == payment_intent_id
        ).first()
        
        if transaction and transaction.status == TransactionStatus.PENDING:
            transaction.status = TransactionStatus.COMPLETED
            wallet = db.query(Wallet).filter(Wallet.id == transaction.wallet_id).first()
            wallet.balance += transaction.amount
            db.commit()
    
    return {"status": "success"}


@router.post("/withdrawal", response_model=WithdrawalResponse, status_code=status.HTTP_201_CREATED)
def create_withdrawal(
    withdrawal_data: WithdrawalCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
    
    if not wallet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wallet not found"
        )
    
    if wallet.balance < withdrawal_data.amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient balance"
        )
    
    pending_withdrawal = db.query(Withdrawal).filter(
        Withdrawal.wallet_id == wallet.id,
        Withdrawal.status == TransactionStatus.PENDING
    ).first()
    
    if pending_withdrawal:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have a pending withdrawal request"
        )
    
    withdrawal = Withdrawal(
        wallet_id=wallet.id,
        amount=withdrawal_data.amount,
        status=TransactionStatus.PENDING,
        payout_method=withdrawal_data.payout_method,
        payout_details=withdrawal_data.payout_details
    )
    
    wallet.balance -= withdrawal_data.amount
    
    transaction = Transaction(
        wallet_id=wallet.id,
        transaction_type=TransactionType.WITHDRAWAL,
        amount=withdrawal_data.amount,
        status=TransactionStatus.PENDING,
        description=f"Withdrawal request via {withdrawal_data.payout_method}"
    )
    
    db.add(withdrawal)
    db.add(transaction)
    db.commit()
    db.refresh(withdrawal)
    
    return withdrawal


@router.get("/withdrawals", response_model=List[WithdrawalResponse])
def get_withdrawals(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
    
    if not wallet:
        return []
    
    withdrawals = db.query(Withdrawal).filter(
        Withdrawal.wallet_id == wallet.id
    ).order_by(Withdrawal.created_at.desc()).all()
    
    return withdrawals
