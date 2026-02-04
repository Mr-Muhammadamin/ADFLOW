from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class MessageCreate(BaseModel):
    receiver_id: int = Field(..., gt=0)
    subject: Optional[str] = Field(None, max_length=200)
    content: str = Field(..., min_length=1)


class MessageResponse(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    subject: Optional[str] = None
    content: str
    is_read: bool
    created_at: datetime
    
    class Config:
        from_attributes = True
