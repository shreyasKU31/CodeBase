# 🚀 DevHance Deployment Guide

This guide will help you deploy your DevHance application to production using various hosting platforms.

## 📋 Prerequisites

- [x] Git repository (GitHub/GitLab)
- [x] Supabase database set up
- [x] Clerk authentication configured
- [x] Cloudinary account for image uploads

## 🎯 Deployment Architecture

```
Frontend (React/Vite) → Vercel/Netlify
Backend (Node.js/Express) → Railway/Render
Database → Supabase (PostgreSQL)
Auth → Clerk
Storage → Cloudinary
```

## 🔧 Pre-Deployment Setup

### 1. Build the Frontend
```bash
cd client
npm run build
```

### 2. Test Production Build Locally
```bash
# Install serve globally
npm install -g serve

# Serve the built files
cd client
serve -s dist -l 3000
```

## 🌐 Frontend Deployment Options

### Option A: Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy Frontend**
   ```bash
   cd client
   vercel
   ```

3. **Set Environment Variables in Vercel Dashboard**
   - `VITE_CLERK_PUBLISHABLE_KEY`: Your production Clerk publishable key
   - `VITE_API_URL`: Your backend URL (e.g., https://your-app.railway.app)

4. **Custom Domain (Optional)**
   - Add your custom domain in Vercel dashboard
   - Update Clerk allowed origins

### Option B: Netlify

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Build and Deploy**
   ```bash
   cd client
   npm run build
   netlify deploy --prod --dir=dist
   ```

3. **Set Environment Variables in Netlify Dashboard**
   - Same as Vercel above

## 🖥️ Backend Deployment Options

### Option A: Railway (Recommended)

1. **Connect GitHub Repository**
   - Go to [Railway.app](https://railway.app)
   - Connect your GitHub repository
   - Select the root directory

2. **Configure Build Settings**
   - Build Command: `cd server && npm install`
   - Start Command: `cd server && npm start`

3. **Set Environment Variables**
   ```
   NODE_ENV=production
   PORT=5000
   CLIENT_URL=https://your-frontend-url.vercel.app
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   CLERK_JWT_KEY=your_production_clerk_jwt_key
   CLERK_ISSUER_URL=https://your-clerk-domain.clerk.accounts.dev/.well-known/jwks.json
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

### Option B: Render

1. **Create New Web Service**
   - Connect your GitHub repository
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`

2. **Set Environment Variables**
   - Same as Railway above

### Option C: Heroku

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Create Heroku App**
   ```bash
   heroku create your-app-name
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set CLIENT_URL=https://your-frontend-url.vercel.app
   # ... add all other environment variables
   ```

4. **Deploy**
   ```bash
   git subtree push --prefix server heroku main
   ```

## 🔐 Production Environment Variables

### Frontend (.env.production)
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_live_your_production_key
VITE_API_URL=https://your-backend-url.railway.app
```

### Backend (Platform Environment Variables)
```env
NODE_ENV=production
PORT=5000
CLIENT_URL=https://your-frontend-url.vercel.app
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
CLERK_JWT_KEY=-----BEGIN PUBLIC KEY-----...-----END PUBLIC KEY-----
CLERK_ISSUER_URL=https://your-domain.clerk.accounts.dev/.well-known/jwks.json
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 🔄 Post-Deployment Configuration

### 1. Update Clerk Settings
- Add your production frontend URL to allowed origins
- Add your production backend URL to allowed origins
- Update redirect URLs

### 2. Update CORS Settings
Your backend should automatically handle CORS with the CLIENT_URL environment variable.

### 3. Test the Deployment
1. Visit your frontend URL
2. Sign in with Clerk
3. Try creating a project
4. Test all major features

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure CLIENT_URL is set correctly in backend
   - Check Clerk allowed origins

2. **Environment Variables Not Loading**
   - Verify all environment variables are set in hosting platform
   - Check for typos in variable names

3. **Build Failures**
   - Check Node.js version compatibility
   - Ensure all dependencies are listed in package.json

4. **Database Connection Issues**
   - Verify Supabase URL and key
   - Check if RLS is properly configured

### Monitoring

- **Frontend**: Use Vercel/Netlify analytics
- **Backend**: Use Railway/Render logs
- **Database**: Use Supabase dashboard
- **Errors**: Implement error tracking (Sentry recommended)

## 🚀 Quick Deploy Commands

### Full Deployment (after initial setup)
```bash
# Build frontend
npm run build

# Deploy frontend (if using Vercel)
npm run deploy:vercel

# Backend deploys automatically via Git push
git add .
git commit -m "Deploy to production"
git push origin main
```

## 📈 Performance Optimization

1. **Frontend**
   - Enable gzip compression
   - Use CDN for static assets
   - Implement code splitting (already configured)

2. **Backend**
   - Enable response compression
   - Implement caching headers
   - Use connection pooling for database

## 🔒 Security Checklist

- [x] Environment variables are secure
- [x] HTTPS is enabled
- [x] CORS is properly configured
- [x] Rate limiting is enabled
- [x] Input validation is implemented
- [x] Authentication tokens are secure

## 📞 Support

If you encounter issues during deployment:
1. Check the logs in your hosting platform
2. Verify all environment variables
3. Test locally with production build
4. Check database connectivity

---

**Happy Deploying! 🎉**