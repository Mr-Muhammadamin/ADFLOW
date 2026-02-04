from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, DateTime, Enum as SQLEnum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from enum import Enum
from app.core.database import Base
from app.models.campaign import PlatformType


class AdSpaceStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"


class AdSpace(Base):
    __tablename__ = "ad_spaces"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    platform_type = Column(SQLEnum(PlatformType), nullable=False)
    description = Column(Text)
    url = Column(String)
    price_per_view = Column(Float, default=0.0)
    price_per_click = Column(Float, default=0.0)
    total_views = Column(Integer, default=0)
    total_clicks = Column(Integer, default=0)
    total_earnings = Column(Float, default=0.0)
    status = Column(SQLEnum(AdSpaceStatus), default=AdSpaceStatus.ACTIVE)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    user = relationship("User", backref="ad_spaces")
