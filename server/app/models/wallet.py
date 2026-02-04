from sqlalchemy import Column, Integer, Float, String, Text, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from enum import Enum
from app.core.database import Base


class TransactionType(str, Enum):
    DEPOSIT = "deposit"
    WITHDRAWAL = "withdrawal"
    CAMPAIGN_SPEND = "campaign_spend"
    EARNING = "earning"
    REFUND = "refund"


class TransactionStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class Wallet(Base):
    __tablename__ = "wallets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    balance = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    user = relationship("User", backref="wallet")
    transactions = relationship("Transaction", back_populates="wallet", cascade="all, delete-orphan")
    withdrawals = relationship("Withdrawal", back_populates="wallet", cascade="all, delete-orphan")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    wallet_id = Column(Integer, ForeignKey("wallets.id"), nullable=False)
    transaction_type = Column(SQLEnum(TransactionType), nullable=False)
    amount = Column(Float, nullable=False)
    status = Column(SQLEnum(TransactionStatus), default=TransactionStatus.COMPLETED)
    description = Column(Text)
    stripe_payment_intent_id = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    wallet = relationship("Wallet", back_populates="transactions")


class Withdrawal(Base):
    __tablename__ = "withdrawals"

    id = Column(Integer, primary_key=True, index=True)
    wallet_id = Column(Integer, ForeignKey("wallets.id"), nullable=False)
    amount = Column(Float, nullable=False)
    status = Column(SQLEnum(TransactionStatus), default=TransactionStatus.PENDING)
    payout_method = Column(String)
    payout_details = Column(Text)
    rejection_reason = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    wallet = relationship("Wallet", back_populates="withdrawals")
