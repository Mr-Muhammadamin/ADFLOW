# AdFlow Deployment Guide

This guide covers deployment options for AdFlow platform.

## Table of Contents
- [Production Environment Setup](#production-environment-setup)
- [Backend Deployment](#backend-deployment)
- [Frontend Deployment](#frontend-deployment)
- [Database Setup](#database-setup)
- [Stripe Configuration](#stripe-configuration)
- [Environment Variables](#environment-variables)
- [Monitoring and Logs](#monitoring-and-logs)

## Production Environment Setup

### Prerequisites
- Linux server (Ubuntu 22.04+ recommended)
- Domain name
- SSL certificate (Let's Encrypt recommended)
- PostgreSQL database (recommended) or MySQL
- Redis (for caching, optional but recommended)

## Backend Deployment

### Option 1: Using Gunicorn with Systemd

1. **Install system dependencies:**
```bash
sudo apt update
sudo apt install python3.11 python3-pip python3-venv nginx postgresql redis-server
```

2. **Set up application user:**
```bash
sudo adduser --system --group --shell /bin/bash --home /opt/adflow adflow
sudo su - adflow
```

3. **Clone and setup application:**
```bash
cd /opt/adflow
git clone <your-repo-url> backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt gunicorn
```

4. **Configure environment variables:**
```bash
nano .env
```
Edit with production settings (see Environment Variables section below).

5. **Run database migrations:**
```bash
cd /opt/adflow/backend
source venv/bin/activate
alembic upgrade head
python seed_data.py
```

6. **Create Systemd service:**
```bash
sudo nano /etc/systemd/system/adflow-backend.service
```

Content:
```ini
[Unit]
Description=AdFlow Backend API
After=network.target

[Service]
User=adflow
Group=adflow
WorkingDirectory=/opt/adflow/backend
Environment="PATH=/opt/adflow/backend/venv/bin"
ExecStart=/opt/adflow/backend/venv/bin/gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 127.0.0.1:8000
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable adflow-backend
sudo systemctl start adflow-backend
sudo systemctl status adflow-backend
```

### Option 2: Docker Deployment

1. **Create Dockerfile for backend:**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn

COPY . .

EXPOSE 8000

CMD ["gunicorn", "app.main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]
```

2. **Build and run:**
```bash
docker build -t adflow-backend .
docker run -d -p 8000:8000 --env-file .env adflow-backend
```

## Frontend Deployment

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Build the project:**
```bash
cd client
npm run build
```

3. **Deploy:**
```bash
vercel --prod
```

### Option 2: Nginx on VPS

1. **Build the frontend:**
```bash
cd client
npm install
npm run build
```

2. **Copy files to server:**
```bash
sudo mkdir -p /var/www/adflow
sudo cp -r dist/* /var/www/adflow/
sudo chown -R www-data:www-data /var/www/adflow
```

3. **Configure Nginx:**
```bash
sudo nano /etc/nginx/sites-available/adflow
```

Content:
```nginx
server {
    listen 80;
    server_name adflow.example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name adflow.example.com;

    ssl_certificate /etc/letsencrypt/live/adflow.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/adflow.example.com/privkey.pem;

    # Frontend
    location / {
        root /var/www/adflow;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files
    location /static {
        proxy_pass http://127.0.0.1:8000;
    }
}
```

4. **Enable site:**
```bash
sudo ln -s /etc/nginx/sites-available/adflow /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Option 3: Docker

```dockerfile
# Frontend Dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

## Database Setup

### PostgreSQL (Production Recommended)

1. **Install and start PostgreSQL:**
```bash
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

2. **Create database and user:**
```bash
sudo -u postgres psql
```

```sql
CREATE DATABASE adflow;
CREATE USER adflow_user WITH ENCRYPTED PASSWORD 'strong_password';
GRANT ALL PRIVILEGES ON DATABASE adflow TO adflow_user;
\q
```

3. **Update .env:**
```bash
DATABASE_URL=postgresql://adflow_user:strong_password@localhost/adflow
```

## Stripe Configuration

1. **Create Stripe account:** https://dashboard.stripe.com

2. **Get API keys:**
   - Go to Developers → API keys
   - Copy Secret key (starts with `sk_live_`)
   - Copy Publishable key (starts with `pk_live_`)

3. **Setup webhook:**
   - Create webhook endpoint: `https://your-domain.com/api/v1/wallet/webhook`
   - Select events: `payment_intent.succeeded`
   - Copy webhook signing secret

4. **Update .env with production keys:**
```bash
STRIPE_SECRET_KEY=sk_live_your_live_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

## Environment Variables

Production `.env` configuration:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost/adflow

# Security (CHANGE THESE IN PRODUCTION!)
SECRET_KEY=generate-secure-random-string-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Stripe
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# CORS
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
```

### Generating Secure Secret Key

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

## Monitoring and Logs

### Backend Logs
```bash
sudo journalctl -u adflow-backend -f
```

### Nginx Logs
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Set up Logrotate
```bash
sudo nano /etc/logrotate.d/adflow
```

Content:
```
/var/log/adflow/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0640 adflow adflow
}
```

## SSL Certificate (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d adflow.example.com
sudo certbot renew --dry-run
```

Add auto-renewal:
```bash
sudo crontab -e
```

Add line:
```
0 0 * * * /usr/bin/certbot renew --quiet
```

## Security Checklist

- [ ] Change default admin password
- [ ] Use strong SECRET_KEY
- [ ] Enable HTTPS everywhere
- [ ] Configure firewall (ufw)
- [ ] Set up database backups
- [ ] Enable rate limiting
- [ ] Monitor system logs
- [ ] Keep dependencies updated
- [ ] Use production database (not SQLite)
- [ ] Disable debug mode

## Backup Strategy

### Database Backup
```bash
# Daily backup cron job
0 2 * * * pg_dump -U adflow_user adflow | gzip > /backups/adflow_$(date +\%Y\%m\%d).sql.gz
```

### File Backup
```bash
# Backup uploaded files
rsync -avz /opt/adflow/server/static/uploads/ /backups/uploads/
```

## Performance Optimization

1. **Enable caching with Redis:**
```bash
sudo apt install redis-server
sudo systemctl start redis
```

2. **Use CDN for static assets:**
   - Configure CloudFront or Cloudflare
   - Serve static files via CDN

3. **Enable Gzip compression in Nginx:**
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml;
gzip_min_length 1000;
```

## Scaling Considerations

- **Horizontal scaling:** Use load balancer with multiple backend instances
- **Database:** Use read replicas for scaling reads
- **Session storage:** Use Redis for session storage
- **Caching:** Cache API responses and database queries

## Troubleshooting

### Backend not starting
```bash
sudo systemctl status adflow-backend
sudo journalctl -xeu adflow-backend
```

### Database connection errors
- Check PostgreSQL is running: `sudo systemctl status postgresql`
- Verify credentials in .env
- Check firewall allows localhost connections

### Nginx 502 Bad Gateway
- Backend service might be down
- Check port 8000 is listening: `sudo netstat -tlnp | grep 8000`
- Review backend logs

### File upload issues
- Check static/uploads directory permissions
- Ensure disk space is available
- Verify Nginx client_max_body_size

## Support

For deployment issues:
- Check server logs
- Review error messages
- Consult API documentation
- Contact development team

---

**Remember:** This is a production deployment guide. Always test in staging environment first!
