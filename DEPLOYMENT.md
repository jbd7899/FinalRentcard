# Deployment Guide

This guide covers the deployment process for MyRentCard in different environments.

## Prerequisites

- Node.js v18 or higher
- PostgreSQL v14 or higher
- AWS account (for production deployments)
- Cloudinary account
- Domain name (for production)

## Environment Setup

1. **Environment Variables**
   ```bash
   # Development
   VITE_API_URL=http://localhost:3000
   DATABASE_URL=postgresql://user:password@localhost:5432/myrentcard
   JWT_SECRET=your-secret-key
   CLOUDINARY_URL=your-cloudinary-url

   # Production
   VITE_API_URL=https://api.yourapp.com
   DATABASE_URL=postgresql://user:password@your-db-host:5432/myrentcard
   JWT_SECRET=your-secure-secret
   CLOUDINARY_URL=your-cloudinary-url
   NODE_ENV=production
   ```

2. **Database Setup**
   ```bash
   # Run migrations
   npm run db:push

   # Verify database connection
   npm run db:verify
   ```

## Development Deployment

1. **Local Development**
   ```bash
   # Install dependencies
   npm install

   # Start development server
   npm run dev
   ```

2. **Development Build**
   ```bash
   # Build the application
   npm run build

   # Preview the build
   npm run preview
   ```

## Production Deployment

### Option 1: Traditional Server

1. **Server Setup**
   - Set up a Linux server (Ubuntu recommended)
   - Install Node.js, PostgreSQL, and Nginx
   - Configure SSL certificates

2. **Application Deployment**
   ```bash
   # Clone repository
   git clone https://github.com/your-org/myrentcard.git

   # Install dependencies
   npm install --production

   # Build application
   npm run build

   # Start production server
   npm start
   ```

3. **Nginx Configuration**
   ```nginx
   server {
       listen 80;
       server_name yourapp.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### Option 2: Docker Deployment

1. **Build Docker Image**
   ```bash
   # Build image
   docker build -t myrentcard:latest .

   # Run container
   docker run -d \
     -p 3000:3000 \
     --env-file .env \
     myrentcard:latest
   ```

2. **Docker Compose**
   ```yaml
   version: '3.8'
   services:
     app:
       build: .
       ports:
         - "3000:3000"
       env_file: .env
       depends_on:
         - db
     db:
       image: postgres:14
       environment:
         POSTGRES_USER: user
         POSTGRES_PASSWORD: password
         POSTGRES_DB: myrentcard
   ```

### Option 3: Cloud Deployment (AWS)

1. **AWS Setup**
   - Set up VPC and security groups
   - Configure RDS for PostgreSQL
   - Set up ECS cluster

2. **Deploy with AWS ECS**
   ```bash
   # Configure AWS CLI
   aws configure

   # Push to ECR
   aws ecr get-login-password --region region | docker login --username AWS --password-stdin aws_account_id.dkr.ecr.region.amazonaws.com
   docker tag myrentcard:latest aws_account_id.dkr.ecr.region.amazonaws.com/myrentcard:latest
   docker push aws_account_id.dkr.ecr.region.amazonaws.com/myrentcard:latest
   ```

3. **Update ECS Service**
   ```bash
   aws ecs update-service --cluster your-cluster --service your-service --force-new-deployment
   ```

## Monitoring and Maintenance

1. **Health Checks**
   - Set up uptime monitoring
   - Configure error tracking (e.g., Sentry)
   - Monitor server resources

2. **Logging**
   ```bash
   # View application logs
   npm run logs

   # Monitor error logs
   npm run logs:error
   ```

3. **Backup Strategy**
   ```bash
   # Database backup
   pg_dump -U user myrentcard > backup.sql

   # Restore from backup
   psql -U user myrentcard < backup.sql
   ```

## SSL Configuration

1. **Generate SSL Certificate**
   ```bash
   # Using Let's Encrypt
   certbot --nginx -d yourapp.com
   ```

2. **SSL Configuration in Nginx**
   ```nginx
   server {
       listen 443 ssl;
       server_name yourapp.com;

       ssl_certificate /etc/letsencrypt/live/yourapp.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/yourapp.com/privkey.pem;

       # SSL configuration
       ssl_protocols TLSv1.2 TLSv1.3;
       ssl_ciphers HIGH:!aNULL:!MD5;
   }
   ```

## Continuous Deployment

1. **GitHub Actions Workflow**
   ```yaml
   name: Deploy
   on:
     push:
       branches: [main]
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
         - name: Deploy to production
           run: |
             npm install
             npm run build
             npm run deploy
   ```

2. **Rollback Procedure**
   ```bash
   # Revert to previous version
   git checkout <previous-tag>
   npm install
   npm run build
   npm run deploy
   ```

## Performance Optimization

1. **Frontend Optimization**
   - Enable gzip compression
   - Configure CDN
   - Implement caching strategies

2. **Backend Optimization**
   - Configure PM2 for clustering
   - Set up Redis caching
   - Optimize database queries

## Security Measures

1. **Security Headers**
   ```nginx
   add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
   add_header X-Frame-Options "SAMEORIGIN" always;
   add_header X-XSS-Protection "1; mode=block" always;
   add_header X-Content-Type-Options "nosniff" always;
   ```

2. **Rate Limiting**
   ```nginx
   limit_req_zone $binary_remote_addr zone=one:10m rate=1r/s;
   limit_req zone=one burst=10 nodelay;
   ```

## Troubleshooting

Common issues and their solutions:

1. **Database Connection Issues**
   - Check connection string
   - Verify network access
   - Check database logs

2. **Application Errors**
   - Check application logs
   - Verify environment variables
   - Check server resources

3. **Performance Issues**
   - Monitor server metrics
   - Check database performance
   - Analyze application logs