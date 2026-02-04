from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.wallet import TransactionType, TransactionStatus


class WalletResponse(BaseModel):
    id: int
    user_id: int
    balance: float
    created_at: datetime
    
    class Config:
        from_attributes = True


class TransactionCreate(BaseModel):
    amount: float = Field(..., gt=0)
    description: Optional[str] = None


class TransactionResponse(BaseModel):
    id: int
    wallet_id: int
    transaction_type: TransactionType
    amount: float
    status: TransactionStatus
    description: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class WithdrawalCreate(BaseModel):
    amount: float = Field(..., gt=0)
    payout_method: str = Field(..., min_length=1)
    payout_details: str = Field(..., min_length=1)


class WithdrawalResponse(BaseModel):
    id: int
    wallet_id: int
    amount: float
    status: TransactionStatus
    payout_method: str
    payout_details: str
    rejection_reason: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class DepositResponse(BaseModel):
    client_secret: str
    amount: float
