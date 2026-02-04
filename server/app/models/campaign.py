from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from enum import Enum
from app.core.database import Base


class PlatformType(str, Enum):
    WEBSITE = "website"
    TELEGRAM = "telegram"
    INSTAGRAM = "instagram"


class CampaignStatus(str, Enum):
    DRAFT = "draft"
    PENDING = "pending"
    ACTIVE = "active"
    PAUSED = "paused"
    FINISHED = "finished"
    REJECTED = "rejected"


class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text)
    platform_type = Column(SQLEnum(PlatformType), nullable=False)
    banner_url = Column(String)
    daily_budget = Column(Float, default=0.0)
    total_budget = Column(Float, default=0.0)
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    status = Column(SQLEnum(CampaignStatus), default=CampaignStatus.DRAFT)
    total_views = Column(Integer, default=0)
    total_clicks = Column(Integer, default=0)
    total_spend = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    user = relationship("User", backref="campaigns")
    views = relationship("CampaignView", back_populates="campaign", cascade="all, delete-orphan")
    clicks = relationship("CampaignClick", back_populates="campaign", cascade="all, delete-orphan")


class CampaignView(Base):
    __tablename__ = "campaign_views"

    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"), nullable=False)
    ad_space_id = Column(Integer, ForeignKey("ad_spaces.id"))
    ip_address = Column(String)
    user_agent = Column(String)
    viewed_at = Column(DateTime(timezone=True), server_default=func.now())
    
    campaign = relationship("Campaign", back_populates="views")


class CampaignClick(Base):
    __tablename__ = "campaign_clicks"

    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"), nullable=False)
    ad_space_id = Column(Integer, ForeignKey("ad_spaces.id"))
    ip_address = Column(String)
    user_agent = Column(String)
    clicked_at = Column(DateTime(timezone=True), server_default=func.now())
    
    campaign = relationship("Campaign", back_populates="clicks")
