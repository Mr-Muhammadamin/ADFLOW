from pydantic import BaseModel, Field, HttpUrl
from typing import Optional
from datetime import datetime
from app.models.ad_space import PlatformType, AdSpaceStatus


class AdSpaceCreate(BaseModel):
    name: str = Field(..., min_length=3, max_length=200)
    platform_type: PlatformType
    description: Optional[str] = None
    url: Optional[HttpUrl] = None
    price_per_view: float = Field(..., ge=0)
    price_per_click: float = Field(..., ge=0)


class AdSpaceUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=3, max_length=200)
    description: Optional[str] = None
    url: Optional[HttpUrl] = None
    price_per_view: Optional[float] = Field(None, ge=0)
    price_per_click: Optional[float] = Field(None, ge=0)
    status: Optional[AdSpaceStatus] = None


class AdSpaceResponse(BaseModel):
    id: int
    user_id: int
    name: str
    platform_type: PlatformType
    description: Optional[str] = None
    url: Optional[str] = None
    price_per_view: float
    price_per_click: float
    total_views: int
    total_clicks: int
    total_earnings: float
    status: AdSpaceStatus
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
