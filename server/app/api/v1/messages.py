from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.deps import get_current_active_user
from app.models.message import Message
from app.models.user import User
from app.schemas.message import MessageCreate, MessageResponse

router = APIRouter(prefix="/messages", tags=["Messages"])


@router.post("/", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def send_message(
    message_data: MessageCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    if message_data.receiver_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot send message to yourself"
        )
    
    receiver = db.query(User).filter(User.id == message_data.receiver_id).first()
    if not receiver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Receiver not found"
        )
    
    message = Message(
        sender_id=current_user.id,
        receiver_id=message_data.receiver_id,
        subject=message_data.subject,
        content=message_data.content
    )
    
    db.add(message)
    db.commit()
    db.refresh(message)
    
    from app.models.notification import Notification
    notification = Notification(
        user_id=message_data.receiver_id,
        type="message",
        title=f"New message from {current_user.username}",
        message=message_data.subject or "You have a new message",
        link=f"/messages/{message.id}"
    )
    db.add(notification)
    db.commit()
    
    return message


@router.get("/inbox", response_model=List[MessageResponse])
def get_inbox(
    unread_only: bool = False,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    query = db.query(Message).filter(Message.receiver_id == current_user.id)
    
    if unread_only:
        query = query.filter(Message.is_read == False)
    
    messages = query.order_by(Message.created_at.desc()).all()
    return messages


@router.get("/sent", response_model=List[MessageResponse])
def get_sent_messages(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    messages = db.query(Message).filter(
        Message.sender_id == current_user.id
    ).order_by(Message.created_at.desc()).all()
    return messages


@router.get("/{message_id}", response_model=MessageResponse)
def get_message(
    message_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    message = db.query(Message).filter(Message.id == message_id).first()
    
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    
    if message.receiver_id != current_user.id and message.sender_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    if message.receiver_id == current_user.id and not message.is_read:
        message.is_read = True
        db.commit()
    
    return message


@router.post("/{message_id}/mark-read")
def mark_message_read(
    message_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    message = db.query(Message).filter(Message.id == message_id).first()
    
    if not message or message.receiver_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    
    message.is_read = True
    db.commit()
    
    return {"status": "success"}
