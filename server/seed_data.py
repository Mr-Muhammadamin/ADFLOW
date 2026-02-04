from app.core.database import SessionLocal
from app.models.user import User, UserRole
from app.models.wallet import Wallet
from app.core.security import get_password_hash

db = SessionLocal()

print("Seeding database...")

admin_user = db.query(User).filter(User.email == "admin@adflow.com").first()
if not admin_user:
    admin_user = User(
        email="admin@adflow.com",
        username="admin",
        hashed_password=get_password_hash("admin123"),
        role=UserRole.ADMIN,
        company_name="AdFlow",
        is_active=True
    )
    db.add(admin_user)
    admin_wallet = Wallet(user_id=admin_user.id, balance=10000.0)
    db.add(admin_wallet)
    print("Created admin user: admin@adflow.com / admin123")

advertiser = db.query(User).filter(User.email == "advertiser@adflow.com").first()
if not advertiser:
    advertiser = User(
        email="advertiser@adflow.com",
        username="advertiser",
        hashed_password=get_password_hash("advertiser123"),
        role=UserRole.ADVERTISER,
        company_name="Test Advertiser",
        is_active=True
    )
    db.add(advertiser)
    advertiser_wallet = Wallet(user_id=advertiser.id, balance=5000.0)
    db.add(advertiser_wallet)
    print("Created advertiser: advertiser@adflow.com / advertiser123")

publisher = db.query(User).filter(User.email == "publisher@adflow.com").first()
if not publisher:
    publisher = User(
        email="publisher@adflow.com",
        username="publisher",
        hashed_password=get_password_hash("publisher123"),
        role=UserRole.PUBLISHER,
        company_name="Test Publisher",
        is_active=True
    )
    db.add(publisher)
    publisher_wallet = Wallet(user_id=publisher.id, balance=1000.0)
    db.add(publisher_wallet)
    print("Created publisher: publisher@adflow.com / publisher123")

db.commit()
db.close()

print("Database seeding completed!")
