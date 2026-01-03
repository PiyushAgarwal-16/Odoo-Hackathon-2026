# Dayflow HRMS - Quick Start Guide

Get Dayflow HRMS running in 10 minutes!

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] npm or yarn installed
- [ ] Railway account created (free)
- [ ] Code editor (VS Code recommended)

## 🚀 Quick Install (3 Steps)

### Step 1: Setup Database (3 minutes)

1. Go to [railway.app](https://railway.app) and login
2. Click **"+ New Project"** → **"Provision PostgreSQL"**
3. Copy the `DATABASE_URL` from the Variables tab

### Step 2: Configure Backend (2 minutes)

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and paste your Railway DATABASE_URL:
```env
DATABASE_URL="postgresql://postgres:xxxxx@xxxxx.railway.app:5432/railway"
JWT_ACCESS_SECRET="change-this-to-random-string"
JWT_REFRESH_SECRET="change-this-to-another-random-string"
```

Run migrations and seed:
```bash
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
```

### Step 3: Configure Frontend (2 minutes)

```bash
cd ../frontend
npm install
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 🎯 Run the Application (2 minutes)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Open `http://localhost:3000` in your browser!

## 🔑 Login

**Admin:**
- Login ID: `OIADMI20260001`
- Password: `Admin@123`

**Employee:**
- Login ID: `OIJODO20260001`  
- Password: `Employee@123`

## ✅ First Tasks to Try

1. **As Admin:**
   - Sign in
   - View employee list
   - Create a new employee
   - Approve leave requests

2. **As Employee:**
   - Sign in (first-time password change)
   - Check-in for the day
   - Request time off
   - View your salary info

## 🆘 Common Issues

**"Cannot connect to database"**
- Check DATABASE_URL is correct
- Ensure Railway database is running (green status)

**"Port 5000 already in use"**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

**"Module not found"**
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

## 📚 Next Steps

- Read [README.md](./README.md) for full documentation
- See [RAILWAY_SETUP.md](./RAILWAY_SETUP.md) for detailed database setup
- Check the implementation plan for architecture details

## 🏗️ Project Structure

```
backend/          → Node.js + Express + Prisma
frontend/         → Next.js + Tailwind + Shadcn/UI
```

## 💡 Development Tips

- Use `npm run prisma:studio` to view database visually
- Check `http://localhost:5000/api` for API status
- Frontend auto-reloads on file changes
- Backend restarts on code changes (tsx watch)

Happy coding! 🎉
