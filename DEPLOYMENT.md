# DevHance Deployment Guide

## Overview

This guide covers deploying DevHance to Netlify for the frontend and a backend hosting service for the API.

## Deployment Strategy

- **Frontend (Client)**: Deploy to Netlify
- **Backend (Server)**: Deploy to Railway, Render, or Heroku
- **Database**: Supabase (already hosted)
- **Authentication**: Clerk (already hosted)
- **File Storage**: Cloudinary (already hosted)

## Step 1: Backend Deployment

### Option A: Railway (Recommended)

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Deploy Backend**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your DevHance repository
   - Set the root directory to `server`

3. **Configure Environment Variables**
   ```env
   SERVER_PORT=your_server_port
   SERVER_URL=https://your-railway-app.railway.app
   CLIENT_URL=https://your-netlify-app.netlify.app
   
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   
   CLERK_JWT_KEY=your_clerk_jwt_key
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret
   
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   
   JWT_SECRET=your_jwt_secret
   ```

4. **Deploy**
   - Railway will automatically deploy when you push to your repository
   - Get your deployment URL from Railway dashboard

### Option B: Render

1. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Deploy Backend**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Set root directory to `server`
   - Build command: `npm install`
   - Start command: `npm start`

3. **Configure Environment Variables**
   - Add all environment variables from the Railway section above
   - Set `SERVER_URL` to your Render URL

### Option C: Heroku

1. **Create Heroku Account**
   - Go to [heroku.com](https://heroku.com)
   - Sign up

2. **Deploy Backend**
   ```bash
   # Install Heroku CLI
   npm install -g heroku
   
   # Login to Heroku
   heroku login
   
   # Create app
   heroku create your-app-name
   
   # Set environment variables
   heroku config:set SERVER_PORT=your_server_port
   heroku config:set SERVER_URL=https://your-app-name.herokuapp.com
   heroku config:set CLIENT_URL=https://your-netlify-app.netlify.app
   # ... add all other environment variables
   
   # Deploy
   git push heroku main
   ```

## Step 2: Frontend Deployment (Netlify)

### 1. Prepare for Deployment

1. **Update Environment Variables**
   Create `client/.env.production`:
   ```env
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_API_URL=https://your-backend-url.com
   VITE_CLIENT_URL=https://your-netlify-app.netlify.app
   VITE_CLIENT_PORT=80
   ```

2. **Update Vite Config for Production**
   ```javascript
   // client/vite.config.js
   import { defineConfig } from 'vite'
   import react from '@vitejs/plugin-react'
   import path from 'path'

   export default defineConfig({
     plugins: [react()],
     resolve: {
       alias: {
         '@': path.resolve(__dirname, './src')
       }
     },
     server: {
       port: process.env.VITE_CLIENT_PORT,
       host: true,
       proxy: {
         '/api': {
           target: process.env.VITE_API_URL,
           changeOrigin: true,
           secure: false
         }
       }
     },
     build: {
       outDir: 'dist',
       sourcemap: false
     }
   })
   ```

### 2. Deploy to Netlify

#### Option A: Deploy via Netlify UI

1. **Create Netlify Account**
   - Go to [netlify.com](https://netlify.com)
   - Sign up with GitHub

2. **Deploy Site**
   - Click "New site from Git"
   - Choose GitHub
   - Select your DevHance repository
   - Set build settings:
     - **Base directory**: `client`
     - **Build command**: `npm run build`
     - **Publish directory**: `dist`

3. **Configure Environment Variables**
   - Go to Site settings → Environment variables
   - Add all variables from `client/.env.production`

4. **Configure Domain**
   - Go to Domain settings
   - Add your custom domain or use Netlify subdomain

#### Option B: Deploy via Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login and Deploy**
   ```bash
   # Login to Netlify
   netlify login
   
   # Navigate to client directory
   cd client
   
   # Build the project
   npm run build
   
   # Deploy
   netlify deploy --prod --dir=dist
   ```

3. **Set Environment Variables**
   ```bash
   netlify env:set VITE_CLERK_PUBLISHABLE_KEY your_clerk_publishable_key
   netlify env:set VITE_SUPABASE_URL your_supabase_url
   netlify env:set VITE_SUPABASE_ANON_KEY your_supabase_anon_key
   netlify env:set VITE_API_URL https://your-backend-url.com
   netlify env:set VITE_CLIENT_URL https://your-netlify-app.netlify.app
   netlify env:set VITE_CLIENT_PORT 80
   ```

## Step 3: Configure Services

### 1. Update Clerk Configuration

1. **Go to Clerk Dashboard**
   - Navigate to your Clerk application
   - Go to Settings → Domains

2. **Add Allowed Origins**
   - Add your Netlify URL: `https://your-app.netlify.app`
   - Add your backend URL: `https://your-backend-url.com`

3. **Update Redirect URLs**
   - Add: `https://your-app.netlify.app/*`
   - Add: `https://your-app.netlify.app/sign-in`
   - Add: `https://your-app.netlify.app/sign-up`

### 2. Update Supabase Configuration

1. **Go to Supabase Dashboard**
   - Navigate to your project
   - Go to Settings → API

2. **Update RLS Policies**
   - Ensure your RLS policies work with your deployment URLs
   - Test database connections

### 3. Update Cloudinary Configuration

1. **Go to Cloudinary Dashboard**
   - Navigate to Settings → Upload
   - Configure upload presets if needed

## Step 4: Test Deployment

### 1. Test Backend
   ```bash
   # Test health endpoint
   curl https://your-backend-url.com/api/health
   
   # Test database connection
   curl https://your-backend-url.com/api/check-schema
   ```

### 2. Test Frontend
   - Visit your Netlify URL
   - Test authentication flow
   - Test project creation
   - Test image uploads

### 3. Test Integration
   - Verify API calls work between frontend and backend
   - Check CORS configuration
   - Test file uploads

## Step 5: Continuous Deployment

### 1. Automatic Deployments
   - Both Netlify and Railway/Render will automatically deploy on git push
   - Ensure your main branch is protected

### 2. Environment-Specific Deployments
   - Create separate environments for staging and production
   - Use different environment variables for each

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure `CLIENT_URL` in backend matches your Netlify URL exactly
   - Check that CORS is properly configured

2. **Environment Variables Not Loading**
   - Verify all environment variables are set in your hosting platform
   - Check that variable names match exactly

3. **Build Failures**
   - Check build logs in Netlify
   - Ensure all dependencies are in package.json
   - Verify Node.js version compatibility

4. **API Connection Issues**
   - Verify backend URL is correct in frontend environment variables
   - Check that backend is running and accessible
   - Test API endpoints directly

### Debug Commands

```bash
# Check backend health
curl https://your-backend-url.com/api/health

# Check environment variables
echo $VITE_API_URL

# Test database connection
curl https://your-backend-url.com/api/check-schema
```

## Security Considerations

1. **Environment Variables**
   - Never commit `.env` files to version control
   - Use different secrets for staging and production
   - Rotate secrets regularly

2. **CORS Configuration**
   - Only allow necessary origins
   - Use HTTPS in production

3. **API Security**
   - Implement rate limiting
   - Use proper authentication
   - Validate all inputs

## Performance Optimization

1. **Frontend**
   - Enable gzip compression in Netlify
   - Use CDN for static assets
   - Optimize images

2. **Backend**
   - Enable caching where appropriate
   - Optimize database queries
   - Use connection pooling

## Monitoring

1. **Netlify Analytics**
   - Enable Netlify Analytics for frontend monitoring
   - Monitor build times and deployment success

2. **Backend Monitoring**
   - Use your hosting platform's monitoring tools
   - Set up error tracking (Sentry, etc.)
   - Monitor API response times

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review hosting platform documentation
3. Check service-specific logs
4. Verify environment variable configuration 