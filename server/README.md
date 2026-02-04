# AdFlow Server API

Backend API for AdFlow - A two-sided advertising traffic management platform.

## Tech Stack

- **Python 3.11+**
- **FastAPI** - Modern web framework for building APIs
- **SQLAlchemy** - SQL toolkit and ORM
- **SQLite/MySQL** - Database
- **Alembic** - Database migrations
- **Pydantic** - Data validation using Python type annotations
- **JWT** - Authentication
- **Stripe** - Payment processing (Test Mode)
- **bcrypt** - Password hashing

## Features

- User authentication (Advertiser, Publisher, Admin roles)
- Campaign management for advertisers
- Ad space management for publishers
- Wallet and payment processing
- Internal messaging system
- Notification system
- Rating and review system
- Admin panel for platform management
- Fraud prevention (basic)
- Analytics and reporting

## Setup Instructions

### Prerequisites

- Python 3.11 or higher
- pip package manager
- Virtual environment (recommended)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd adflow/server
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` file and configure:
- `DATABASE_URL` - SQLite or MySQL connection string
- `SECRET_KEY` - Secret key for JWT tokens (change in production!)
- `STRIPE_SECRET_KEY` - Your Stripe secret key (test mode)
- `STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key
- `ALLOWED_ORIGINS` - CORS allowed origins

5. Initialize database:
```bash
python seed_data.py
```

This will create the database, run migrations, and seed test data.

### Running the Server

Development mode:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Production mode:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

The API will be available at `http://localhost:8000`

### API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Database Migrations

### Create a new migration
```bash
alembic revision --autogenerate -m "description of changes"
```

### Apply migrations
```bash
alembic upgrade head
```

### Rollback migrations
```bash
alembic downgrade -1
```

## Project Structure

```
server/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── admin.py        # Admin endpoints
│   │       ├── auth.py        # Authentication endpoints
│   │       ├── campaigns.py   # Campaign endpoints
│   │       ├── ad_spaces.py   # Ad space endpoints
│   │       ├── wallet.py      # Wallet & payment endpoints
│   │       ├── messages.py    # Messaging endpoints
│   │       ├── notifications.py # Notification endpoints
│   │       └── reviews.py     # Review endpoints
│   ├── core/
│   │   ├── config.py         # Configuration
│   │   ├── database.py       # Database connection
│   │   ├── security.py       # Security utilities (JWT, hashing)
│   │   └── deps.py          # Dependencies (auth, roles)
│   ├── models/
│   │   ├── user.py          # User model
│   │   ├── campaign.py      # Campaign models
│   │   ├── ad_space.py      # Ad space model
│   │   ├── wallet.py        # Wallet & transaction models
│   │   ├── message.py       # Message model
│   │   ├── notification.py  # Notification model
│   │   └── review.py        # Review model
│   ├── schemas/
│   │   ├── user.py          # User schemas
│   │   ├── campaign.py      # Campaign schemas
│   │   ├── ad_space.py      # Ad space schemas
│   │   ├── wallet.py        # Wallet schemas
│   │   ├── message.py       # Message schemas
│   │   ├── notification.py  # Notification schemas
│   │   └── review.py        # Review schemas
│   ├── services/
│   │   └── stripe_service.py # Stripe integration
│   ├── alembic/
│   │   └── versions/       # Database migrations
│   └── main.py             # FastAPI application
├── static/
│   └── uploads/            # Uploaded files (banners)
├── alembic.ini             # Alembic configuration
├── requirements.txt         # Python dependencies
├── .env.example            # Environment variables template
├── seed_data.py            # Database seeding script
└── README.md               # This file
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh access token

### Campaigns (Advertiser)
- `GET /api/v1/campaigns/` - List campaigns
- `POST /api/v1/campaigns/` - Create campaign
- `GET /api/v1/campaigns/{id}` - Get campaign details
- `PUT /api/v1/campaigns/{id}` - Update campaign
- `POST /api/v1/campaigns/{id}/pause` - Pause campaign
- `POST /api/v1/campaigns/{id}/resume` - Resume campaign
- `POST /api/v1/campaigns/{id}/activate` - Activate campaign
- `GET /api/v1/campaigns/{id}/stats` - Get campaign statistics
- `POST /api/v1/campaigns/upload-banner` - Upload banner image

### Ad Spaces (Publisher)
- `GET /api/v1/ad-spaces/` - List ad spaces
- `POST /api/v1/ad-spaces/` - Create ad space
- `GET /api/v1/ad-spaces/{id}` - Get ad space details
- `PUT /api/v1/ad-spaces/{id}` - Update ad space

### Wallet & Payments
- `GET /api/v1/wallet/` - Get wallet balance
- `GET /api/v1/wallet/transactions` - List transactions
- `POST /api/v1/wallet/deposit` - Create deposit (Stripe)
- `POST /api/v1/wallet/webhook` - Stripe webhook
- `POST /api/v1/wallet/withdrawal` - Request withdrawal
- `GET /api/v1/wallet/withdrawals` - List withdrawals

### Messages
- `GET /api/v1/messages/inbox` - Get received messages
- `GET /api/v1/messages/sent` - Get sent messages
- `POST /api/v1/messages/` - Send message
- `GET /api/v1/messages/{id}` - Get message details
- `POST /api/v1/messages/{id}/mark-read` - Mark as read

### Notifications
- `GET /api/v1/notifications/` - List notifications
- `GET /api/v1/notifications/{id}` - Get notification
- `POST /api/v1/notifications/{id}/mark-read` - Mark as read
- `POST /api/v1/notifications/mark-all-read` - Mark all as read
- `GET /api/v1/notifications/unread-count` - Get unread count

### Reviews
- `GET /api/v1/reviews/{user_id}` - Get user reviews
- `GET /api/v1/reviews/{user_id}/average-rating` - Get average rating
- `POST /api/v1/reviews/` - Create review

### Admin
- `GET /api/v1/admin/stats` - Get platform statistics
- `GET /api/v1/admin/users` - List all users
- `POST /api/v1/admin/users/{id}/block` - Block user
- `POST /api/v1/admin/users/{id}/unblock` - Unblock user
- `GET /api/v1/admin/campaigns/pending` - Get pending campaigns
- `POST /api/v1/admin/campaigns/{id}/approve` - Approve campaign
- `POST /api/v1/admin/campaigns/{id}/reject` - Reject campaign
- `GET /api/v1/admin/withdrawals/pending` - Get pending withdrawals
- `POST /api/v1/admin/withdrawals/{id}/approve` - Approve withdrawal
- `POST /api/v1/admin/withdrawals/{id}/reject` - Reject withdrawal

## Authentication

All protected endpoints require a valid JWT access token in the Authorization header:
```
Authorization: Bearer <access_token>
```

Tokens are obtained by logging in:
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'
```

## Test Accounts

The seed script creates these test accounts:

### Admin
- Email: `admin@adflow.com`
- Password: `admin123`
- Role: Admin

### Advertiser
- Email: `advertiser@adflow.com`
- Password: `advertiser123`
- Role: Advertiser
- Balance: $5,000

### Publisher
- Email: `publisher@adflow.com`
- Password: `publisher123`
- Role: Publisher
- Balance: $1,000

## Security Notes

1. Change the `SECRET_KEY` in production
2. Use environment variables for sensitive data
3. Enable HTTPS in production
4. Implement rate limiting (basic implementation included)
5. Use a production database (PostgreSQL/MySQL recommended)
6. Set up proper CORS configuration
7. Implement input validation (Pydantic schemas included)

## Deployment

### Using Gunicorn (Production)
```bash
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Using Docker (Optional)
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Troubleshooting

### Database connection errors
- Check your `DATABASE_URL` in `.env`
- Ensure database file/directory has proper permissions
- For MySQL, ensure server is running

### Stripe payment errors
- Verify your Stripe keys are correct
- Use test mode for development
- Check Stripe webhook configuration

### Import errors
- Ensure you're in the server directory
- Activate your virtual environment
- Install all dependencies from requirements.txt

## Support

For issues and questions, please open an issue in the repository or contact the development team.
