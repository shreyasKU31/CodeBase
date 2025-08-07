# DevHance Setup Guide

## Environment Variables

Create a `.env` file in the server directory with the following variables:

```env
# Server Configuration
SERVER_PORT=your_server_port
SERVER_URL=your_backend_url
CLIENT_URL=your_client_url

# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Clerk Configuration
CLERK_JWT_KEY=your_clerk_jwt_key_here
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret_here

# Cloudinary Configuration (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Create a `.env` file in the client directory:

```env
# Clerk Configuration
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here

# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# API Configuration
VITE_API_URL=your_backend_url_here
VITE_CLIENT_URL=your_frontend_url_here
VITE_CLIENT_PORT=your_client_port_here
```

## Database Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com)
2. **Run the SQL commands** from `database-schema.sql` in your Supabase SQL editor
3. **Copy your Supabase URL and anon key** from Settings > API to the server `.env` file

## Clerk Setup

1. **Create a Clerk application** at [clerk.com](https://clerk.com)
2. **Get your keys** from the Clerk dashboard:
   - **Publishable Key**: Copy to client `.env` as `VITE_CLERK_PUBLISHABLE_KEY`
   - **JWT Key**: Copy to server `.env` as `CLERK_JWT_KEY`
3. **Configure your application**:
   - Set your application URL to your client URL
   - Add your client URL to allowed origins

## Cloudinary Setup (Optional)

1. **Create a Cloudinary account** at [cloudinary.com](https://cloudinary.com)
2. **Get your credentials** from the dashboard
3. **Add them to the server `.env` file**

## Running the Application

1. **Install dependencies**:
   ```bash
   # Server
   cd server && npm install
   
   # Client
   cd client && npm install
   ```

2. **Start the server**:
   ```bash
   cd server && npm start
   ```

3. **Start the client**:
   ```bash
   cd client && npm run dev
   ```

## Fixed Issues

The application has been fixed to be fully functional:

### 1. **Supabase Query Structure**
- Fixed all queries to follow proper Supabase syntax from the [documentation](https://supabase.com/docs/reference/javascript/select)
- Implemented proper joins using the correct syntax: `author:users (id, username, display_name, profile_picture)`
- Added proper count queries using `{ count: "exact", head: true }`

### 2. **Clerk Authentication Flow**
- Simplified authentication checks following [Clerk React documentation](https://clerk.com/docs/quickstarts/react)
- Removed complex profile checking that was causing infinite loops
- Implemented proper route protection using `isSignedIn` checks

### 3. **Database Schema**
- Updated schema to work with Clerk authentication (TEXT for user IDs instead of UUID)
- Disabled Row Level Security since we're using Clerk for auth
- Fixed foreign key relationships

### 4. **API Routes**
- Fixed all Supabase queries to use proper syntax
- Added missing like/unlike routes
- Implemented proper error handling
- Fixed data structure for frontend consumption

### 5. **Frontend Components**
- Simplified Dashboard and AddProject components
- Removed infinite loading issues
- Implemented proper loading states
- Fixed authentication flow

## Key Features Now Working

✅ **User Authentication** - Sign up/sign in with Clerk  
✅ **Dashboard** - View all public projects  
✅ **Add Project** - Create new projects with images  
✅ **Project Details** - View individual projects  
✅ **Like System** - Like and unlike projects  
✅ **User Profiles** - View user profiles and projects  
✅ **Image Upload** - Upload project images to Cloudinary  
✅ **Responsive Design** - Works on all devices  

## Troubleshooting

### Common Issues:

1. **"Missing Publishable Key" error**:
   - Make sure `VITE_CLERK_PUBLISHABLE_KEY` is set in client `.env`

2. **Database connection errors**:
   - Verify Supabase URL and anon key in server `.env`
   - Run the database schema in Supabase SQL editor

3. **Authentication not working**:
   - Check Clerk configuration in dashboard
   - Verify JWT key in server `.env`

4. **Image upload not working**:
   - Set up Cloudinary account and add credentials to server `.env`
   - Or remove Cloudinary integration if not needed

## API Endpoints

- `GET /api/projects/discover` - Get all public projects
- `GET /api/projects/:id` - Get specific project
- `POST /api/projects` - Create new project
- `POST /api/projects/:id/like` - Like a project
- `DELETE /api/projects/:id/like` - Unlike a project
- `GET /api/users/profile` - Get user profile
- `POST /api/users/sync` - Sync Clerk user to database
- `POST /api/users/profile` - Update user profile 