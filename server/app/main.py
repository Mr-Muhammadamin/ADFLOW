from fastapi import FastAPI, Request, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi import Form
from app.core.config import settings
from app.api.v1 import auth, campaigns, ad_spaces as ad_spaces_api, wallet, messages as messages_api, notifications, reviews, admin
from app.core.database import engine, get_db
from app.models import Base
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.campaign import Campaign
from app.models.ad_space import AdSpace
from app.models.wallet import Wallet, Transaction
from datetime import datetime, timedelta

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AdFlow API",
    description="Two-sided advertising traffic management platform",
    version="1.0.0"
)

templates = Jinja2Templates(directory="templates")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

# Include API routes
app.include_router(auth.router, prefix="/api/v1")
app.include_router(campaigns.router, prefix="/api/v1")
app.include_router(ad_spaces_api.router, prefix="/api/v1")
app.include_router(wallet.router, prefix="/api/v1")
app.include_router(messages_api.router, prefix="/api/v1")
app.include_router(notifications.router, prefix="/api/v1")
app.include_router(reviews.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")


# Helper function to get current user (simplified for demo)
def get_current_user_simple(request: Request, db: Session = Depends(get_db)):
    user_id = request.cookies.get("user_id")
    if not user_id:
        return None
    try:
        user = db.query(User).filter(User.id == int(user_id)).first()
        return user
    except:
        return None


# Custom filter for number formatting
def format_number(value):
    if value is None:
        return "0"
    if value >= 1000000:
        return f"{value/1000000:.1f}M"
    if value >= 1000:
        return f"{value/1000:.1f}K"
    return str(value)

templates.env.filters["format_number"] = format_number


@app.get("/")
def root(request: Request, db: Session = Depends(get_db)):
    current_user = get_current_user_simple(request, db)
    return templates.TemplateResponse("index.html", {"request": request, "current_user": current_user})


@app.get("/features")
def features(request: Request, db: Session = Depends(get_db)):
    current_user = get_current_user_simple(request, db)
    return templates.TemplateResponse("index.html", {"request": request, "current_user": current_user})


@app.get("/pricing")
def pricing(request: Request, db: Session = Depends(get_db)):
    current_user = get_current_user_simple(request, db)
    return templates.TemplateResponse("index.html", {"request": request, "current_user": current_user})


@app.get("/login", response_class=HTMLResponse)
def login_page(request: Request, db: Session = Depends(get_db)):
    current_user = get_current_user_simple(request, db)
    if current_user:
        return RedirectResponse(url="/advertiser/dashboard" if current_user.role == "advertiser" else "/publisher/dashboard")
    return templates.TemplateResponse("login.html", {"request": request, "current_user": current_user})


@app.get("/register", response_class=HTMLResponse)
def register_page(request: Request, selected_role: str = "advertiser", db: Session = Depends(get_db)):
    current_user = get_current_user_simple(request, db)
    if current_user:
        return RedirectResponse(url="/advertiser/dashboard" if current_user.role == "advertiser" else "/publisher/dashboard")
    return templates.TemplateResponse("register.html", {"request": request, "current_user": current_user, "selected_role": selected_role})


@app.post("/api/v1/auth/login")
def login(email: str = Form(...), password: str = Form(...), request: Request = None, db: Session = Depends(get_db)):
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    user = db.query(User).filter(User.email == email).first()
    if not user or not pwd_context.verify(password, user.hashed_password):
        return templates.TemplateResponse("login.html", {
            "request": request,
            "current_user": None,
            "error": "Invalid email or password"
        })
    
    response = RedirectResponse(url=f"/{'advertiser' if user.role == 'advertiser' else 'publisher'}/dashboard", status_code=302)
    response.set_cookie(key="user_id", value=str(user.id), httponly=True)
    return response


@app.post("/api/v1/auth/register")
def register(
    email: str = Form(...),
    password: str = Form(...),
    first_name: str = Form(...),
    last_name: str = Form(...),
    role: str = Form("advertiser"),
    company: str = Form(""),
    request: Request = None,
    db: Session = Depends(get_db)
):
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        return templates.TemplateResponse("register.html", {
            "request": request,
            "current_user": None,
            "error": "Email already registered",
            "selected_role": role
        })
    
    user = User(
        email=email,
        hashed_password=pwd_context.hash(password),
        name=f"{first_name} {last_name}",
        role=role,
        company=company
    )
    db.add(user)
    db.commit()
    
    # Create wallet for user
    wallet = Wallet(user_id=user.id, balance=0.0)
    db.add(wallet)
    db.commit()
    
    response = RedirectResponse(url="/login", status_code=302)
    return response


@app.get("/logout")
def logout():
    response = RedirectResponse(url="/")
    response.delete_cookie("user_id")
    return response


# Advertiser Routes
@app.get("/advertiser/dashboard", response_class=HTMLResponse)
def advertiser_dashboard(request: Request, db: Session = Depends(get_db)):
    current_user = get_current_user_simple(request, db)
    if not current_user or current_user.role != "advertiser":
        return RedirectResponse(url="/login")
    
    # Get stats
    user_campaigns = db.query(Campaign).filter(Campaign.advertiser_id == current_user.id).all()
    total_campaigns = len(user_campaigns)
    active_campaigns = len([c for c in user_campaigns if c.status == "active"])
    
    wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
    
    # Demo data for display
    stats = {
        "total_campaigns": total_campaigns,
        "active_campaigns": active_campaigns,
        "total_impressions": 125000,
        "total_clicks": 3750
    }
    
    # Recent campaigns (demo)
    recent_campaigns = []
    for i, c in enumerate(user_campaigns[:5] if user_campaigns else []):
        recent_campaigns.append({
            "name": c.name,
            "status": c.status,
            "impressions": 25000 + (i * 5000),
            "clicks": 750 + (i * 150),
            "ad_space_name": "Tech Blog Banner"
        })
    
    if not recent_campaigns:
        recent_campaigns = [
            {"name": "Summer Sale Campaign", "status": "active", "impressions": 45000, "clicks": 1350, "ad_space_name": "Tech Daily"},
            {"name": "Product Launch", "status": "paused", "impressions": 12000, "clicks": 240, "ad_space_name": "Business Insider"}
        ]
    
    recent_activities = [
        {"message": "Campaign 'Summer Sale' is now active", "time": "2 hours ago", "icon": "play-circle", "color": "success"},
        {"message": "New message from Publisher", "time": "5 hours ago", "icon": "envelope", "color": "primary"},
        {"message": "Payment received", "time": "1 day ago", "icon": "currency-dollar", "color": "warning"},
    ]
    
    return templates.TemplateResponse("advertiser/dashboard.html", {
        "request": request,
        "current_user": current_user,
        "stats": stats,
        "wallet": {"balance": wallet.balance if wallet else 0},
        "recent_campaigns": recent_campaigns,
        "recent_activities": recent_activities,
        "unread_messages": 2
    })


@app.get("/advertiser/campaigns", response_class=HTMLResponse)
def advertiser_campaigns(request: Request, status_filter: str = "all", db: Session = Depends(get_db)):
    current_user = get_current_user_simple(request, db)
    if not current_user or current_user.role != "advertiser":
        return RedirectResponse(url="/login")
    
    campaigns = db.query(Campaign).filter(Campaign.advertiser_id == current_user.id).all()
    
    if status_filter != "all":
        campaigns = [c for c in campaigns if c.status == status_filter]
    
    campaign_list = []
    for c in campaigns:
        campaign_list.append({
            "id": c.id,
            "name": c.name,
            "status": c.status,
            "budget": c.budget or 0,
            "spent": (c.budget or 0) * 0.6,
            "impressions": 50000,
            "clicks": 1500,
            "created_at": c.created_at.strftime("%Y-%m-%d") if c.created_at else "",
            "ad_space_name": "Tech Blog",
            "ad_space_category": "Technology"
        })
    
    if not campaign_list:
        campaign_list = [
            {"id": 1, "name": "Summer Sale 2024", "status": "active", "budget": 500, "spent": 250, "impressions": 45000, "clicks": 1350, "created_at": "2024-01-15", "ad_space_name": "Tech Daily", "ad_space_category": "Technology"},
            {"id": 2, "name": "Product Launch", "status": "paused", "budget": 1000, "spent": 400, "impressions": 12000, "clicks": 240, "created_at": "2024-01-10", "ad_space_name": "Business Insider", "ad_space_category": "Business"},
        ]
    
    return templates.TemplateResponse("advertiser/campaigns.html", {
        "request": request,
        "current_user": current_user,
        "campaigns": campaign_list,
        "status_filter": status_filter
    })


@app.get("/advertiser/campaigns/new", response_class=HTMLResponse)
def new_campaign(request: Request, db: Session = Depends(get_db)):
    current_user = get_current_user_simple(request, db)
    if not current_user or current_user.role != "advertiser":
        return RedirectResponse(url="/login")
    
    # Get available ad spaces
    ad_spaces = db.query(AdSpace).filter(AdSpace.is_active == True).all()
    ad_space_list = [{"id": s.id, "name": s.name, "category": s.category} for s in ad_spaces]
    
    if not ad_space_list:
        ad_space_list = [
            {"id": 1, "name": "Tech Daily Blog", "category": "Technology"},
            {"id": 2, "name": "Business Insider", "category": "Business"},
            {"id": 3, "name": "Health & Fitness Weekly", "category": "Health"},
        ]
    
    return templates.TemplateResponse("advertiser/new_campaign.html", {
        "request": request,
        "current_user": current_user,
        "ad_spaces": ad_space_list
    })


@app.get("/advertiser/ad-spaces", response_class=HTMLResponse)
def advertiser_ad_spaces(request: Request, search: str = "", category: str = "", db: Session = Depends(get_db)):
    current_user = get_current_user_simple(request, db)
    if not current_user or current_user.role != "advertiser":
        return RedirectResponse(url="/login")
    
    # Get all active ad spaces
    ad_spaces = db.query(AdSpace).filter(AdSpace.is_active == True).all()
    
    # Demo data
    ad_spaces_list = [
        {"id": 1, "name": "Tech Daily", "category": "Technology", "description": "Daily tech news and reviews for tech enthusiasts", "audience_size": 500000, "ctr": 2.5, "cpm": 15.00, "location": "United States", "age_range": "25-45", "owner_id": 2},
        {"id": 2, "name": "Business Insider Pro", "category": "Business", "description": "Business news and market analysis for professionals", "audience_size": 250000, "ctr": 1.8, "cpm": 25.00, "location": "Worldwide", "age_range": "30-55", "owner_id": 2},
        {"id": 3, "name": "Health & Fitness Hub", "category": "Health", "description": "Health tips, workout plans, and nutrition advice", "audience_size": 350000, "ctr": 3.2, "cpm": 12.00, "location": "United States", "age_range": "20-50", "owner_id": 3},
        {"id": 4, "name": "Travel Adventures", "category": "Travel", "description": "Travel guides, destination reviews, and tips", "audience_size": 180000, "ctr": 2.1, "cpm": 18.00, "location": "Worldwide", "age_range": "25-45", "owner_id": 3},
        {"id": 5, "name": "Finance Today", "category": "Finance", "description": "Stock market updates, investment advice, personal finance", "audience_size": 420000, "ctr": 1.5, "cpm": 30.00, "location": "United States", "age_range": "35-60", "owner_id": 2},
        {"id": 6, "name": "Foodie Heaven", "category": "Lifestyle", "description": "Restaurant reviews, recipes, and food culture", "audience_size": 280000, "ctr": 2.8, "cpm": 14.00, "location": "United States", "age_range": "18-45", "owner_id": 3},
    ]
    
    # Filter
    if category:
        ad_spaces_list = [s for s in ad_spaces_list if s["category"].lower() == category.lower()]
    if search:
        ad_spaces_list = [s for s in ad_spaces_list if search.lower() in s["name"].lower() or search.lower() in s["description"].lower()]
    
    return templates.TemplateResponse("advertiser/ad_spaces.html", {
        "request": request,
        "current_user": current_user,
        "ad_spaces": ad_spaces_list,
        "search_query": search,
        "page": 1,
        "total_pages": 1
    })


# Publisher Routes
@app.get("/publisher/dashboard", response_class=HTMLResponse)
def publisher_dashboard(request: Request, db: Session = Depends(get_db)):
    current_user = get_current_user_simple(request, db)
    if not current_user or current_user.role != "publisher":
        return RedirectResponse(url="/login")
    
    # Get publisher stats
    ad_spaces = db.query(AdSpace).filter(AdSpace.owner_id == current_user.id).all()
    total_ad_spaces = len(ad_spaces)
    active_ad_spaces = len([s for s in ad_spaces if s.is_active])
    
    wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
    
    stats = {
        "total_earnings": 1245.00,
        "total_ad_spaces": total_ad_spaces or 3,
        "active_ad_spaces": active_ad_spaces or 2,
        "total_impressions": 125000,
        "avg_ctr": 2.4
    }
    
    # Demo active ads
    active_ads = [
        {"ad_space_name": "Tech Daily Banner", "ad_space_category": "Technology", "advertiser_name": "TechStartup Inc", "impressions": 45000, "clicks": 1350, "earnings": 225.00},
        {"ad_space_name": "Business Insider Sidebar", "ad_space_category": "Business", "advertiser_name": "Marketing Pro", "impressions": 32000, "clicks": 480, "earnings": 180.00},
    ]
    
    ad_spaces_list = [
        {"name": "Tech Daily Banner", "category": "Technology", "is_active": True, "impressions": 45000, "clicks": 1350, "earnings": 225.00},
        {"name": "Business Sidebar", "category": "Business", "is_active": True, "impressions": 32000, "clicks": 480, "earnings": 180.00},
        {"name": "Health Blog Footer", "category": "Health", "is_active": False, "impressions": 0, "clicks": 0, "earnings": 0.00},
    ]
    
    return templates.TemplateResponse("publisher/dashboard.html", {
        "request": request,
        "current_user": current_user,
        "stats": stats,
        "wallet": {"balance": wallet.balance if wallet else 1000},
        "active_ads": active_ads,
        "ad_spaces": ad_spaces_list,
        "unread_messages": 1
    })


@app.get("/publisher/ad-spaces", response_class=HTMLResponse)
def publisher_ad_spaces(request: Request, db: Session = Depends(get_db)):
    current_user = get_current_user_simple(request, db)
    if not current_user or current_user.role != "publisher":
        return RedirectResponse(url="/login")
    
    ad_spaces = db.query(AdSpace).filter(AdSpace.owner_id == current_user.id).all()
    
    ad_spaces_list = [
        {"id": 1, "name": "Tech Daily Banner", "category": "Technology", "is_active": True, "description": "Leaderboard banner on tech news page", "dimensions": "728x90", "audience_size": 500000, "cpm": 15.00},
        {"id": 2, "name": "Business Sidebar", "category": "Business", "is_active": True, "description": "Sidebar ad on business articles", "dimensions": "300x250", "audience_size": 250000, "cpm": 25.00},
        {"id": 3, "name": "Health Blog Footer", "category": "Health", "is_active": False, "description": "Footer banner on health tips", "dimensions": "728x90", "audience_size": 350000, "cpm": 12.00},
    ]
    
    return templates.TemplateResponse("publisher/ad_spaces.html", {
        "request": request,
        "current_user": current_user,
        "ad_spaces": ad_spaces_list
    })


# Wallet Route
@app.get("/wallet", response_class=HTMLResponse)
def wallet_page(request: Request, db: Session = Depends(get_db)):
    current_user = get_current_user_simple(request, db)
    if not current_user:
        return RedirectResponse(url="/login")
    
    wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
    
    transactions = [
        {"date": "2024-01-20", "description": "Campaign Payment", "type": "campaign", "amount": -150.00, "status": "completed", "campaign_name": "Summer Sale"},
        {"date": "2024-01-18", "description": "Wallet Deposit", "type": "deposit", "amount": 500.00, "status": "completed"},
        {"date": "2024-01-15", "description": "Campaign Payment", "type": "campaign", "amount": -75.00, "status": "completed", "campaign_name": "Product Launch"},
        {"date": "2024-01-10", "description": "Earning from Ad", "type": "earning", "amount": 45.00, "status": "completed", "campaign_name": "Tech Ad"},
    ]
    
    return templates.TemplateResponse("wallet.html", {
        "request": request,
        "current_user": current_user,
        "wallet": {"balance": wallet.balance if wallet else 0, "total_spent": 225, "total_earned": 1000, "pending": 0},
        "transactions": transactions
    })


# Messages Route
@app.get("/messages", response_class=HTMLResponse)
def messages_page(request: Request, db: Session = Depends(get_db)):
    current_user = get_current_user_simple(request, db)
    if not current_user:
        return RedirectResponse(url="/login")
    
    conversations = [
        {"id": 1, "name": "John Smith", "initials": "JS", "color": "primary", "last_message": "Thanks for the quick response!", "time": "2h ago", "unread": 2},
        {"id": 2, "name": "Sarah Miller", "initials": "SM", "color": "success", "last_message": "I'll review your proposal", "time": "1d ago", "unread": 0},
        {"id": 3, "name": "Mike Johnson", "initials": "MJ", "color": "warning", "last_message": "Can we discuss the campaign?", "time": "2d ago", "unread": 0},
    ]
    
    # Get list of users for new message
    users = db.query(User).filter(User.id != current_user.id).all()
    users_list = [{"id": u.id, "name": u.name, "role": u.role} for u in users[:10]]
    
    if not users_list:
        users_list = [
            {"id": 2, "name": "John Smith", "role": "advertiser"},
            {"id": 3, "name": "Sarah Miller", "role": "publisher"},
        ]
    
    return templates.TemplateResponse("messages.html", {
        "request": request,
        "current_user": current_user,
        "conversations": conversations,
        "selected_conversation": None,
        "unread_count": 2,
        "users": users_list
    })


@app.get("/health")
def health_check():
    return {"status": "healthy"}


# Also serve the root as the landing page
@app.get("/")
def root():
    return {"message": "Welcome to AdFlow API", "version": "1.0.0", "docs": "/docs", "frontend": "/login"}
