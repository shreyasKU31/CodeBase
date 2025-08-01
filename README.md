# DevHance - Developer Portfolio Platform

A modern platform for developers to showcase their projects and build their careers. DevHance empowers students and developers to tell the complete story behind their code through a simple, elegant, and community-driven portfolio builder.

## 🚀 Features

- **Multi-provider Authentication** - Secure login with Clerk
- **Project Showcase** - Create detailed project case studies with images, videos, and stories
- **Discover Feed** - Browse and discover amazing projects from other developers
- **Like & Comment System** - Engage with the community
- **Profile Management** - Complete user profiles with social links
- **Modern UI** - Clean, responsive design with shadcn/ui components
- **File Upload** - Image uploads with Cloudinary integration
- **Real-time Updates** - Dynamic content updates

## 🛠 Tech Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Clerk
- **File Storage**: Cloudinary
- **UI Components**: shadcn/ui + Tailwind CSS
- **Styling**: Tailwind CSS

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account
- Clerk account
- Cloudinary account

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone <repository-url>
cd devhance
```

### 2. Install dependencies
```bash
npm run install-all
```

### 3. Environment Setup

#### Server Environment Variables
Copy `server/env.example` to `server/.env` and fill in your values:

```bash
cp server/env.example server/.env
```

```env
# Server Configuration
PORT=5000
CLIENT_URL=http://localhost:5173

# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Clerk Configuration
CLERK_JWT_KEY=your_clerk_jwt_key
CLERK_ISSUER_URL=https://clerk.your-domain.com

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

#### Client Environment Variables
Copy `client/env.example` to `client/.env` and fill in your values:

```bash
cp client/env.example client/.env
```

```env
# Clerk Configuration
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

### 4. Database Setup

Run the SQL schema in your Supabase SQL editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(30) UNIQUE NOT NULL,
    display_name VARCHAR(50) NOT NULL,
    headline VARCHAR(100),
    location VARCHAR(50),
    profile_picture TEXT,
    bio TEXT,
    github_url TEXT,
    linkedin_url TEXT,
    website_url TEXT,
    is_profile_complete BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    story TEXT NOT NULL,
    thumbnail TEXT NOT NULL,
    images TEXT[],
    videos TEXT[],
    tech_stack VARCHAR(50)[],
    github_url TEXT,
    live_url TEXT,
    figma_url TEXT,
    youtube_url TEXT,
    other_links JSONB,
    tags VARCHAR(50)[],
    author UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project likes table
CREATE TABLE project_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

-- Project comments table
CREATE TABLE project_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_projects_author ON projects(author);
CREATE INDEX idx_projects_created_at ON projects(created_at);
CREATE INDEX idx_project_likes_project_id ON project_likes(project_id);
CREATE INDEX idx_project_comments_project_id ON project_comments(project_id);

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_project_comments_updated_at BEFORE UPDATE ON project_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can read all public profiles
CREATE POLICY "Users can read public profiles" ON users FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- Projects policies
CREATE POLICY "Anyone can read public projects" ON projects FOR SELECT USING (is_public = true);
CREATE POLICY "Users can read own projects" ON projects FOR SELECT USING (auth.uid()::text = author::text);
CREATE POLICY "Users can insert own projects" ON projects FOR INSERT WITH CHECK (auth.uid()::text = author::text);
CREATE POLICY "Users can update own projects" ON projects FOR UPDATE USING (auth.uid()::text = author::text);
CREATE POLICY "Users can delete own projects" ON projects FOR DELETE USING (auth.uid()::text = author::text);

-- Likes policies
CREATE POLICY "Anyone can read likes" ON project_likes FOR SELECT USING (true);
CREATE POLICY "Users can insert own likes" ON project_likes FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own likes" ON project_likes FOR DELETE USING (auth.uid()::text = user_id::text);

-- Comments policies
CREATE POLICY "Anyone can read comments" ON project_comments FOR SELECT USING (true);
CREATE POLICY "Users can insert own comments" ON project_comments FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own comments" ON project_comments FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own comments" ON project_comments FOR DELETE USING (auth.uid()::text = user_id::text);
```

### 5. Service Setup

#### Clerk Setup
1. Create a Clerk account at [clerk.com](https://clerk.com)
2. Create a new application
3. Get your publishable key and JWT key
4. Configure your domain in Clerk settings

#### Cloudinary Setup
1. Create a Cloudinary account at [cloudinary.com](https://cloudinary.com)
2. Get your cloud name, API key, and API secret
3. Configure upload presets if needed

#### Supabase Setup
1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new project
3. Get your project URL and anon key
4. Run the database schema above

### 6. Start the development server
```bash
npm run dev
```

This will start both the backend server (port 5000) and frontend development server (port 5173).

## 📁 Project Structure

```
devhance/
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   │   └── ui/        # shadcn/ui components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utility functions
│   │   └── main.jsx       # App entry point
│   ├── public/            # Static assets
│   └── package.json
├── server/                # Backend Node.js app
│   ├── config/           # Configuration files
│   ├── middleware/       # Express middleware
│   ├── routes/           # API routes
│   ├── utils/            # Utility functions
│   └── index.js          # Server entry point
├── database-schema.sql   # Database schema
└── package.json          # Root package.json
```

## 🎯 Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run server` - Start only the backend server
- `npm run client` - Start only the frontend development server
- `npm run build` - Build the frontend for production
- `npm run install-all` - Install dependencies for both frontend and backend

## 🔑 Key Features Explained

### Authentication Flow
1. Users sign in through Clerk's multi-provider authentication
2. JWT tokens are used for API authentication
3. Protected routes require valid authentication

### Project Creation
1. Users fill out a comprehensive project form
2. Images are uploaded to Cloudinary
3. Project data is stored in Supabase
4. Real-time updates reflect changes

### Discover Feed
1. Public projects are displayed in chronological order
2. Users can like and comment on projects
3. Project details show complete case studies

### Profile Management
1. Mandatory profile setup on first login
2. Users can update their profile information
3. Social links and bio customization

## 🔒 Security Features

- **Row Level Security (RLS)** - Database-level security policies
- **Rate Limiting** - API request throttling
- **Helmet** - Security headers
- **Input Validation** - Server-side validation with express-validator
- **CORS** - Cross-origin resource sharing configuration
- **JWT Verification** - Secure token validation

## 🎨 Design System

- **Primary Color**: #6100FF (Purple)
- **Typography**: System fonts with Tailwind CSS
- **Components**: shadcn/ui component library
- **Responsive**: Mobile-first design approach
- **Dark Mode**: Built-in dark mode support

## 🚀 Deployment

### Frontend Deployment
1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting provider
3. Configure environment variables in production

### Backend Deployment
1. Deploy to your preferred Node.js hosting (Heroku, Railway, etc.)
2. Set environment variables in your hosting platform
3. Configure CORS for your production domain

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues or have questions, please:
1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information

## 🗺 Roadmap

- [ ] Real-time notifications
- [ ] Project templates
- [ ] Advanced search and filtering
- [ ] Project analytics
- [ ] Team collaboration features
- [ ] Mobile app
- [ ] API documentation
- [ ] Integration with GitHub/GitLab 