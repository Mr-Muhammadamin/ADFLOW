# AdFlow

A complete two-sided advertising traffic management platform MVP that connects advertisers with publishers.

## 🚀 Overview

AdFlow is a modern, production-ready SaaS platform that enables:
- **Advertisers** to create and manage ad campaigns across multiple platforms
- **Publishers** to monetize their websites, Telegram channels, and Instagram pages
- **Admins** to oversee platform operations and manage users

## ✨ Features

### Core Functionality
- 🔐 **Role-based Authentication** - Advertiser, Publisher, and Admin roles
- 📊 **Analytics Dashboard** - Real-time views, clicks, CTR, and spend tracking
- 💳 **Wallet System** - Add funds via Stripe, request withdrawals
- 📬 **Internal Messaging** - Direct communication between users
- 🔔 **Notification System** - Real-time updates for important events
- ⭐ **Rating & Review System** - User feedback and trust building

### For Advertisers
- Create and manage ad campaigns
- Set daily and total budget limits
- Upload banner images
- Platform targeting (Website, Telegram, Instagram)
- Campaign analytics and reporting
- Auto-matching or manual publisher selection

### For Publishers
- Add and manage ad spaces
- Set pricing per view and per click
- Accept or reject ad requests
- Track earnings and withdrawal requests
- View detailed performance analytics

### For Admins
- Platform-wide statistics
- User management (block/unblock)
- Campaign approval workflow
- Withdrawal approval/rejection
- Global oversight and moderation

## 🛠 Tech Stack

### Backend
- **Python 3.11+**
- **FastAPI** - Modern async web framework
- **SQLAlchemy** - ORM and database toolkit
- **SQLite/MySQL** - Database (SQLite default, MySQL ready)
- **Alembic** - Database migrations
- **Pydantic** - Data validation
- **JWT** - Authentication with access/refresh tokens
- **Stripe** - Payment processing (Test Mode)
- **bcrypt** - Password hashing

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - State management
- **Axios** - HTTP client
- **Lucide React** - Icon library
- **React Router** - Client-side routing

## 📁 Project Structure

```
adflow/
├── client/                 # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API services
│   │   ├── store/          # State management
│   │   └── lib/            # Utilities
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── server/                 # FastAPI Backend
    ├── app/
    │   ├── api/           # API endpoints
    │   ├── models/         # Database models
    │   ├── schemas/        # Pydantic schemas
    │   ├── core/           # Core functionality
    │   └── services/       # Business logic
    ├── static/             # Static files
    ├── requirements.txt
    └── README.md
```

## 🚀 Getting Started

### Prerequisites
- Python 3.11 or higher
- Node.js 18 or higher
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd adflow
```

2. **Set up the Backend**
```bash
cd server
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python seed_data.py
uvicorn app.main:app --reload
```

The backend API will be available at `http://localhost:8000`

3. **Set up the Frontend** (in a new terminal)
```bash
cd client
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Test Accounts

The seed script creates these test accounts:

#### Admin
- Email: `admin@adflow.com`
- Password: `admin12`

#### Advertiser
- Email: `advertiser@adflow.com`
- Password: `adv12`
- Balance: $5,000

#### Publisher
- Email: `publisher@adflow.com`
- Password: `pub12`
- Balance: $1,000

## 📚 API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🔧 Configuration

### Backend Environment Variables (.env)
```bash
DATABASE_URL=sqlite:///./adflow.db
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Frontend Configuration
Frontend API base URL is configured in `vite.config.js`. The Vite proxy handles API requests to the backend.

## 🏗 Deployment

### Backend Deployment
1. Set up a production database (PostgreSQL recommended)
2. Configure environment variables
3. Install production dependencies
4. Run migrations: `alembic upgrade head`
5. Use Gunicorn + Uvicorn workers:
```bash
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### Frontend Deployment
1. Build the production bundle:
```bash
npm run build
```
2. Deploy the `dist` folder to any static hosting service (Vercel, Netlify, etc.)
3. Configure the API URL for production

## 🔒 Security

- JWT access and refresh tokens
- Password hashing with bcrypt
- Role-based access control
- Input validation with Pydantic
- CORS configuration
- Basic fraud prevention (click tracking)
- SQL injection protection (via SQLAlchemy ORM)

## 🎨 Features Overview

### Dark Mode
The platform includes a fully functional dark/light mode toggle that persists user preference.

### Responsive Design
Mobile-first design that works seamlessly on all device sizes.

### Real-time Updates
- Notifications for campaign approvals, messages, withdrawals
- Live dashboard statistics
- Instant wallet balance updates

## 📊 Database Schema

Key entities:
- **Users** - Authentication and roles
- **Campaigns** - Advertiser campaigns
- **Ad Spaces** - Publisher ad inventory
- **Wallets** - User balances
- **Transactions** - Financial transactions
- **Messages** - Internal messaging
- **Notifications** - User notifications
- **Reviews** - User ratings

## 🧪 Testing

### Backend Tests (Future Enhancement)
```bash
pytest
```

### Frontend Tests (Future Enhancement)
```bash
npm run test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- FastAPI for the excellent web framework
- React and Vite for the frontend tooling
- Tailwind CSS for the utility-first CSS framework
- Stripe for payment processing

## 📞 Support

For support, email support@adflow.com or open an issue in the repository.

## 🗺 Roadmap

Future enhancements:
- [ ] Advanced analytics and reporting
- [ ] A/B testing for campaigns
- [ ] Real-time chat support
- [ ] Mobile applications
- [ ] Advanced fraud detection
- [ ] Multi-language support
- [ ] API marketplace for integrations
- [ ] White-label solution options

---

**Built with ❤️ for the advertising community**
