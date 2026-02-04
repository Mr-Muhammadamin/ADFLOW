from pydantic import BaseModel, Field, HttpUrl
from typing import Optional
from datetime import datetime
from app.models.campaign import PlatformType, CampaignStatus


class CampaignCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    description: Optional[str] = None
    platform_type: PlatformType
    banner_url: Optional[str] = None
    daily_budget: float = Field(..., ge=0)
    total_budget: float = Field(..., ge=0)
    start_date: datetime
    end_date: datetime


class CampaignUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=200)
    description: Optional[str] = None
    banner_url: Optional[str] = None
    daily_budget: Optional[float] = Field(None, ge=0)
    total_budget: Optional[float] = Field(None, ge=0)
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    status: Optional[CampaignStatus] = None


class CampaignResponse(BaseModel):
    id: int
    user_id: int
    title: str
    description: Optional[str] = None
    platform_type: PlatformType
    banner_url: Optional[str] = None
    daily_budget: float
    total_budget: float
    start_date: datetime
    end_date: datetime
    status: CampaignStatus
    total_views: int
    total_clicks: int
    total_spend: float
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class CampaignStats(BaseModel):
    total_views: int
    total_clicks: int
    ctr: float
    total_spend: float
