from app.core.database import SessionLocal, engine, Base
from app.models.user import User, UserRole
from app.models.wallet import Wallet
import bcrypt

print("Creating database tables...")
Base.metadata.create_all(bind=engine)

db = SessionLocal()

print("Seeding database...")

admin_password = bcrypt.hashpw(b"admin12", bcrypt.gensalt())
admin_user = db.query(User).filter(User.email == "admin@adflow.com").first()
if not admin_user:
    admin_user = User(
        email="admin@adflow.com",
        username="admin",
        hashed_password=admin_password.decode('utf-8'),
        role=UserRole.ADMIN,
        company_name="AdFlow",
        is_active=True
    )
    db.add(admin_user)
    db.flush()
    admin_wallet = Wallet(user_id=admin_user.id, balance=10000.0)
    db.add(admin_wallet)
    print("Created admin user: admin@adflow.com / admin12")

adv_password = bcrypt.hashpw(b"adv12", bcrypt.gensalt())
advertiser = db.query(User).filter(User.email == "advertiser@adflow.com").first()
if not advertiser:
    advertiser = User(
        email="advertiser@adflow.com",
        username="advertiser",
        hashed_password=adv_password.decode('utf-8'),
        role=UserRole.ADVERTISER,
        company_name="Test Advertiser",
        is_active=True
    )
    db.add(advertiser)
    db.flush()
    advertiser_wallet = Wallet(user_id=advertiser.id, balance=5000.0)
    db.add(advertiser_wallet)
    print("Created advertiser: advertiser@adflow.com / adv12")

pub_password = bcrypt.hashpw(b"pub12", bcrypt.gensalt())
publisher = db.query(User).filter(User.email == "publisher@adflow.com").first()
if not publisher:
    publisher = User(
        email="publisher@adflow.com",
        username="publisher",
        hashed_password=pub_password.decode('utf-8'),
        role=UserRole.PUBLISHER,
        company_name="Test Publisher",
        is_active=True
    )
    db.add(publisher)
    db.flush()
    publisher_wallet = Wallet(user_id=publisher.id, balance=1000.0)
    db.add(publisher_wallet)
    print("Created publisher: publisher@adflow.com / pub12")

db.commit()
db.close()

print("Database seeding completed!")
