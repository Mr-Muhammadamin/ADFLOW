from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum as SQLEnum
from sqlalchemy.sql import func
from enum import Enum
from app.core.database import Base


class UserRole(str, Enum):
    ADMIN = "admin"
    ADVERTISER = "advertiser"
    PUBLISHER = "publisher"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False)
    is_active = Column(Boolean, default=True)
    is_blocked = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    stripe_customer_id = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    company_name = Column(String, nullable=True)
