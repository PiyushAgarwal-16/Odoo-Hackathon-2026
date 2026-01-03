# Deployment Configuration Summary

## ✅ Configuration Complete

### Backend (Railway)
- **Domain**: `odoo-hackathon-2026-production.up.railway.app`
- **API Base URL**: `https://odoo-hackathon-2026-production.up.railway.app/api`
- **CORS Configured**: ✅ Allows Vercel frontend

### Frontend (Vercel)
- **Domain**: `https://odoo-hackathon-2026.vercel.app`
- **API URL**: Points to Railway backend

---

## 🚀 Deployment Steps

### Railway Backend Deployment

1. **Commit and push your changes**:
   ```bash
   git add .
   git commit -m "Configure CORS for production"
   git push origin main
   ```

2. **Railway will auto-deploy** from your connected repository

3. **Verify deployment**:
   - Check Railway dashboard for deployment status
   - Test API: `https://odoo-hackathon-2026-production.up.railway.app/api`

### Vercel Frontend Deployment

1. **Set Environment Variable in Vercel**:
   - Go to Vercel Dashboard → Your Project
   - Settings → Environment Variables
   - Add:
     - **Key**: `NEXT_PUBLIC_API_URL`
     - **Value**: `https://odoo-hackathon-2026-production.up.railway.app/api`
     - **Environments**: Production, Preview, Development

2. **Deploy**:
   ```bash
   git add .
   git commit -m "Configure production API URL"
   git push origin main
   ```
   
   OR manually redeploy in Vercel dashboard

---

## 🧪 Testing

### Test Backend API
```bash
curl https://odoo-hackathon-2026-production.up.railway.app/api
```

Expected response:
```json
{
  "message": "Dayflow HRMS API",
  "version": "1.0.0",
  "status": "running"
}
```

### Test Frontend
1. Go to `https://odoo-hackathon-2026.vercel.app`
2. Login with demo credentials:
   - **Admin**: OIADMI20260001 / Admin@123
   - **Employee**: OIJODO20260001 / Employee@123

---

## 🔧 Local Development

Your local environment is also configured:

**Frontend** (`.env.local`):
- Points to Railway backend in production
- To test with local backend, change to: `http://localhost:5000/api`

**Backend**:
- CORS allows both local and Vercel frontend
- Database connected to Railway PostgreSQL

---

## ⚠️ Important Notes

1. **Database**: Both local and production use the same Railway PostgreSQL database
2. **Egress Fees**: Using Railway's public URL from local dev will incur small egress fees
3. **For local development**: Consider using a separate local database to avoid fees

---

## 📝 Next Steps

1. Commit and push your changes to trigger deployments
2. Set `NEXT_PUBLIC_API_URL` in Vercel environment variables
3. Test the production deployment
4. (Optional) Set up separate staging/development databases
