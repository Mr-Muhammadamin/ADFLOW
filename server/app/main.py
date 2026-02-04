from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.api.v1 import auth, campaigns, ad_spaces, wallet, messages, notifications, reviews, admin
from app.core.database import engine
from app.models import Base

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AdFlow API",
    description="Two-sided advertising traffic management platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(auth.router, prefix="/api/v1")
app.include_router(campaigns.router, prefix="/api/v1")
app.include_router(ad_spaces.router, prefix="/api/v1")
app.include_router(wallet.router, prefix="/api/v1")
app.include_router(messages.router, prefix="/api/v1")
app.include_router(notifications.router, prefix="/api/v1")
app.include_router(reviews.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")


@app.get("/")
def root():
    return {
        "message": "Welcome to AdFlow API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}
