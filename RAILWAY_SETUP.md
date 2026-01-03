# Railway PostgreSQL Setup Guide

This guide will help you set up a PostgreSQL database on Railway for the Dayflow HRMS project.

## Step-by-Step Instructions

### 1. Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Click **"Start a New Project"** or **"Login with GitHub"**
3. Sign up or log in with your GitHub account

### 2. Create a New Project

1. Once logged in, click **"+ New Project"**
2. Select **"Provision PostgreSQL"**
3. Railway will automatically create a PostgreSQL database for you

### 3. Get Your Database Connection String

1. Click on the **PostgreSQL** service in your project
2. Go to the **"Variables"** tab
3. Look for the `DATABASE_URL` variable
4. Click the **copy icon** to copy the full database URL

The URL format will look like this:
```
postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/[DATABASE_NAME]
```

Example:
```
postgresql://postgres:Ab12Cd34Ef56@containers-us-west-1.railway.app:5432/railway
```

### 4. Configure Your Backend .env File

1. Navigate to your backend folder:
   ```bash
   cd backend
   ```

2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

3. Open `.env` and update the `DATABASE_URL`:
   ```env
   DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/[DATABASE_NAME]"
   ```

   Paste the entire connection string you copied from Railway.

4. Complete the rest of the `.env` file:
   ```env
   DATABASE_URL="postgresql://postgres:..."  # From Railway
   JWT_ACCESS_SECRET="your-super-secret-access-key-change-this"
   JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-this"
   PORT=5000
   NODE_ENV=development
   COMPANY_CODE="OI"
   COMPANY_NAME="Odoo India"
   ```

   **Important:** Generate strong, random secrets for JWT_ACCESS_SECRET and JWT_REFRESH_SECRET. You can use:
   ```bash
   # On Linux/Mac
   openssl rand -base64 32
   
   # On Windows PowerShell
   [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
   ```

### 5. Push Database Schema to Railway

```bash
# Make sure you're in the backend directory
cd backend

# Install dependencies if you haven't
npm install

# Generate Prisma Client
npm run prisma:generate

# Push the schema to Railway database
npm run prisma:push
```

You should see output like:
```
🚀  Your database is now in sync with your Prisma schema.
```

### 6. Seed the Database

```bash
npm run prisma:seed
```

This will create:
- 1 Admin user (Login: OIADMI20260001, Password: Admin@123)
- 1 Sample employee (Login: OIJODO20260001, Password: Employee@123)
- Sample salary info and leave allocations

### 7. Verify Database Setup

You can use Railway's built-in database viewer:

1. In your Railway project, click on the **PostgreSQL** service
2. Click on the **"Data"** tab
3. You should see your tables populated with data

Alternatively, use Prisma Studio:
```bash
npm run prisma:studio
```

This opens a visual database browser at `http://localhost:5555`

## Troubleshooting

### Connection Refused Error

If you get a connection refused error:
1. Make sure the DATABASE_URL is correctly copied (no extra spaces)
2. Check if Railway database is running (should show green status)
3. Wait a minute for the database to fully initialize

### SSL Certificate Error

If you get SSL errors, modify your DATABASE_URL to include SSL params:
```
postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/[DATABASE_NAME]?sslmode=require
```

### Database Reset

If you need to reset your database:
```bash
# This will delete all data and recreate tables
npm run prisma:push -- --force-reset

# Then re-seed
npm run prisma:seed
```

## Production Deployment

When deploying to production:

1. **DO NOT** commit your `.env` file
2. Set environment variables directly in Railway:
   - Click on your backend service (if deploying backend to Railway)
   - Go to "Variables" tab
   - Add each environment variable

3. After deployment, run migrations:
   ```bash
   npx prisma db push --skip-generate
   npx prisma db seed
   ```

## Database Maintenance

### Viewing Logs

In Railway:
1. Click on PostgreSQL service
2. Go to "Logs" tab
3. Monitor database activity

### Backing Up Data

Railway provides automatic backups, but you can also manually export:

```bash
# Using pg_dump (requires PostgreSQL installed locally)
pg_dump [DATABASE_URL] > backup.sql
```

### Connecting from Other Tools

Use the DATABASE_URL with any PostgreSQL client:
- TablePlus
- DBeaver  
- pgAdmin
- DataGrip

## Cost & Limits

**Railway Free Tier:**
- $5 free credit per month
- PostgreSQL usage is metered
- Typical usage for this HRMS: ~$1-3/month
- Database size limit: 1GB

**Tips to minimize costs:**
- Delete unused projects
- Use Railway's sleep feature for development
- Monitor usage in the Railway dashboard

## Next Steps

Once your database is set up:
1. ✅ Start the backend server: `npm run dev`
2. ✅ Test API endpoints
3. ✅ Configure frontend to connect to backend
4. ✅ Start building!

---

**Need Help?** Check Railway's [documentation](https://docs.railway.app/) or the Dayflow README.
