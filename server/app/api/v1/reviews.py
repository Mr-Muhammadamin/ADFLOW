from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.core.database import get_db
from app.core.deps import get_current_active_user
from app.models.review import Review
from app.models.user import User
from app.schemas.review import ReviewCreate, ReviewResponse

router = APIRouter(prefix="/reviews", tags=["Reviews"])


@router.post("/", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review(
    review_data: ReviewCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    if review_data.reviewee_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot review yourself"
        )
    
    existing_review = db.query(Review).filter(
        Review.reviewer_id == current_user.id,
        Review.reviewee_id == review_data.reviewee_id
    ).first()
    
    if existing_review:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already reviewed this user"
        )
    
    reviewee = db.query(User).filter(User.id == review_data.reviewee_id).first()
    if not reviewee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    review = Review(
        reviewer_id=current_user.id,
        reviewee_id=review_data.reviewee_id,
        rating=review_data.rating,
        comment=review_data.comment
    )
    
    db.add(review)
    db.commit()
    db.refresh(review)
    
    return review


@router.get("/{user_id}", response_model=List[ReviewResponse])
def get_user_reviews(
    user_id: int,
    db: Session = Depends(get_db)
):
    reviews = db.query(Review).filter(
        Review.reviewee_id == user_id
    ).order_by(Review.created_at.desc()).all()
    
    return reviews


@router.get("/{user_id}/average-rating")
def get_user_average_rating(user_id: int, db: Session = Depends(get_db)):
    result = db.query(func.avg(Review.rating)).filter(
        Review.reviewee_id == user_id
    ).scalar()
    
    count = db.query(Review).filter(Review.reviewee_id == user_id).count()
    
    return {
        "average_rating": round(result, 2) if result else 0.0,
        "total_reviews": count
    }
