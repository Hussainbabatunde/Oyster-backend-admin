# AWS EC2 & S3 Deployment Guide for Oyster Backend

This guide provides complete, step-by-step instructions to deploy **Oyster Backend** to your existing AWS EC2 server alongside your current running API using **Termius**, **PM2**, a **separate PostgreSQL database**, **AWS S3 Bucket for Image Storage**, **Namecheap DNS**, and **Nginx with SSL**.

---

## 📋 Overview of Setup

| Component | Setting / Value |
| :--- | :--- |
| **Server** | Existing AWS EC2 (Ubuntu/Linux) managed via Termius |
| **Process Manager** | `PM2` (Running alongside your current API) |
| **New Backend Port** | `5002` (Or any unused port on your EC2 instance) |
| **Database** | Dedicated PostgreSQL Database (`oyster_db`) |
| **Image Storage** | **AWS S3 Bucket** (`@aws-sdk/client-s3`) |
| **DNS Manager** | Namecheap (Creating an **A Record** for subdomain, e.g. `oyster-api.yourdomain.com`) |
| **Reverse Proxy** | Nginx + Certbot (Let's Encrypt SSL) |

---

## 🪣 STEP 1: Create & Configure AWS S3 Bucket for Image Uploads

### A. Create the S3 Bucket in AWS Console
1. Log in to the **AWS Management Console** -> Search for **S3** -> Click **Create bucket**.
2. **Bucket name**: `oyster-product-images` *(Must be globally unique, lower-case)*.
3. **AWS Region**: Select your preferred region (e.g. `us-east-1` or `eu-west-1`).
4. **Object Ownership**: Choose **ACLs disabled (recommended)** or **ACLs enabled**.
5. **Block Public Access settings for this bucket**:
   - Uncheck **"Block *all* public access"** (since product images must be viewable by web users).
   - Check the acknowledgement box: *"I acknowledge that the current settings might result in this bucket and the objects within it becoming public."*
6. Click **Create bucket**.

---

### B. Add Public Read Bucket Policy
To allow public visitors/frontend to view product images uploaded to S3:
1. Click on your newly created bucket (`oyster-product-images`) -> Select the **Permissions** tab.
2. Scroll down to **Bucket policy** -> Click **Edit** and paste the following policy (replace `oyster-product-images` with your exact bucket name):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::oyster-product-images/*"
    }
  ]
}
```
3. Click **Save changes**.

---

### C. Add CORS Configuration (Cross-Origin Resource Sharing)
1. Still under the **Permissions** tab of your bucket, scroll down to **Cross-origin resource sharing (CORS)**.
2. Click **Edit** and paste:

```json
[
  {
    "AllowedHeaders": [
      "*"
    ],
    "AllowedMethods": [
      "GET",
      "PUT",
      "POST",
      "DELETE",
      "HEAD"
    ],
    "AllowedOrigins": [
      "*"
    ],
    "ExposeHeaders": []
  }
]
```
3. Click **Save changes**.

---

### D. Create IAM Credentials for the Backend
1. Go to **AWS IAM Console** -> **Users** -> Click **Add user**.
2. User name: `oyster-s3-uploader` -> Click **Next**.
3. Under **Permissions options**, select **Attach policies directly**.
4. Search for `AmazonS3FullAccess` -> Select the checkbox -> Click **Next** -> Click **Create user**.
5. Select the newly created user `oyster-s3-uploader` -> Open the **Security credentials** tab.
6. Scroll down to **Access keys** -> Click **Create access key**.
7. Choose **Application running outside AWS** -> Click **Next** -> Click **Create access key**.
8. Copy your **Access key ID** and **Secret access key** (save them securely).

Add them to your `.env` file:
```env
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=oyster-product-images
AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXXXXX
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 🗄️ STEP 2: Create a Separate PostgreSQL Database on AWS

You can create a new PostgreSQL database directly on your EC2 server (**Option A**, free & recommended) or on AWS RDS (**Option B**).

### Option A: Create a New Local Database on EC2 (Recommended)

Connect to your EC2 server in **Termius** and run:

```bash
# 1. Switch to the postgres user
sudo -u postgres psql

# 2. Inside PostgreSQL prompt, create a new database and dedicated user
CREATE DATABASE oyster_db;
CREATE USER oyster_user WITH ENCRYPTED PASSWORD 'YourStrongSecurePassword123!';
GRANT ALL PRIVILEGES ON DATABASE oyster_db TO oyster_user;

# 3. Grant schema permissions (For PostgreSQL 15+)
\c oyster_db
GRANT ALL ON SCHEMA public TO oyster_user;

# 4. Exit psql
\q
```

Your `DATABASE_URL` string will be:
```env
DATABASE_URL="postgresql://oyster_user:YourStrongSecurePassword123!@localhost:5432/oyster_db?schema=public"
```

---

## 🌐 STEP 3: Configure Subdomain DNS in Namecheap

1. Log in to your **Namecheap Dashboard** -> **Domain List** -> Click **Manage** next to your domain.
2. Select the **Advanced DNS** tab.
3. Click **Add New Record**:
   - **Type**: `A Record`
   - **Host**: `oyster-api` *(or whatever subdomain you prefer, e.g. `api-oyster`)*
   - **Value**: `YOUR_AWS_EC2_PUBLIC_IP` *(Same Public IP used for your existing server)*
   - **TTL**: `Automatic`
4. Save changes. (DNS propagation usually takes 1–5 minutes).

---

## 🚀 STEP 4: Clone & Prepare `oyster-backend` on your EC2 Server

Connect to your EC2 server via **Termius** and perform the following:

```bash
# 1. Navigate to your web apps folder (e.g. /var/www or ~/apps)
cd /var/www

# 2. Clone your git repository
git clone <YOUR_GIT_REPOSITORY_URL> oyster-backend
cd oyster-backend

# 3. Install Node dependencies
npm install

# 4. Create production .env file
nano .env
```

Paste your production environment variables into `.env`:

```env
PORT=5002
DATABASE_URL="postgresql://oyster_user:YourStrongSecurePassword123!@localhost:5432/oyster_db?schema=public"
DIRECT_URL="postgresql://oyster_user:YourStrongSecurePassword123!@localhost:5432/oyster_db?schema=public"

JWT_SECRET="your_production_super_secret_jwt_key_2026"
FRONTEND_URL="https://admin.yourdomain.com"

# SMTP Nodemailer Settings
EMAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=businessdevelopment@oysterelectronics.com
MAIL_PASS=your_google_app_password

# AWS S3 Bucket Image Upload Settings
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=oyster-product-images
AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXXXXX
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Save and exit (`Ctrl+O`, `Enter`, `Ctrl+X`).

---

## 🗃️ STEP 5: Run Prisma Database Migrations & Build

In Termius inside `/var/www/oyster-backend`:

```bash
# 1. Push schema tables to your new PostgreSQL database
npx prisma db push

# 2. Seed default admin & initial data
npm run seed

# 3. Build TypeScript code to dist/
npm run build
```

---

## ⚡ STEP 6: Start & Manage with PM2

Run PM2 using the included `ecosystem.config.js` to start `oyster-backend` alongside your existing running API:

```bash
# Start oyster-backend with PM2 on port 5002
pm2 start ecosystem.config.js

# Save PM2 process list so it restarts automatically on server reboot
pm2 save

# Verify all running APIs
pm2 list
```

You will see both your existing API and `oyster-backend` active in `pm2 list`!

To monitor logs in real-time:
```bash
pm2 logs oyster-backend
```

---

## 🛡️ STEP 7: Configure Nginx & SSL (Certbot)

To route requests from `oyster-api.yourdomain.com` to `http://127.0.0.1:5002`:

1. Create Nginx site config:
```bash
sudo nano /etc/nginx/sites-available/oyster-api
```

2. Add the following block:
```nginx
server {
    server_name oyster-api.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:5002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

3. Enable the site and reload Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/oyster-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

4. Issue SSL Certificate via Certbot:
```bash
sudo certbot --nginx -d oyster-api.yourdomain.com
```

---

## 🎯 Verification Checklist

- [x] AWS S3 Bucket `oyster-product-images` created with public read bucket policy.
- [x] AWS IAM User access key added to `.env`.
- [x] Run `pm2 list` in Termius — both apps are active (`online`).
- [x] Test image upload API: `POST /api/upload` returns `https://oyster-product-images.s3.us-east-1.amazonaws.com/products/...`.
- [x] Test Forgot Password Nodemailer sending on production API!
