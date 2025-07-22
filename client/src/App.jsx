import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { UserProvider } from './contexts/UserContext'
import { useUser } from './hooks/useUser'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import ProjectDetail from './pages/ProjectDetail'
import AddProject from './pages/AddProject'
import ProfileSetup from './pages/ProfileSetup'
import UserProfile from './pages/UserProfile'
import MyProjects from './pages/MyProjects'
import LoadingSpinner from './components/LoadingSpinner'

function AppRoutes() {
  const { isLoaded, isSignedIn } = useAuth()
  const { user, loading, isFirstTime } = useUser()

  console.log('AppRoutes state:', { isLoaded, isSignedIn, loading, isFirstTime, hasUser: !!user })

  // THE GOLDEN RULE: Show loading spinner until Clerk is fully loaded
  if (!isLoaded) {
    console.log('Showing loading spinner - Clerk not loaded yet')
    return <LoadingSpinner />
  }

  // If user is signed in and we're still loading user data, show loading
  if (isSignedIn && loading) {
    console.log('Showing loading spinner - fetching user data')
    return <LoadingSpinner />
  }

  // If user is not signed in, we don't need to wait for user data
  // Just proceed with the routes

  return (
    <div className="min-h-screen bg-background">
      <Routes>
        {/* Public routes - only accessible when not signed in */}
        <Route 
          path="/" 
          element={
            isSignedIn ? <Navigate to="/dashboard" replace /> : <LandingPage />
          } 
        />
        <Route path="/project/:id" element={<ProjectDetail />} />
        <Route path="/user/:username" element={<UserProfile />} />
        
        {/* Profile setup - mandatory for first-time users */}
        <Route 
          path="/profile-setup" 
          element={
            isSignedIn ? (
              isFirstTime ? <ProfileSetup /> : <Navigate to="/dashboard" replace />
            ) : <Navigate to="/" replace />
          } 
        />
        
        {/* Protected routes - redirect to profile setup if first time */}
        <Route 
          path="/dashboard" 
          element={
            isSignedIn ? (
              isFirstTime ? <Navigate to="/profile-setup" replace /> : <Dashboard />
            ) : <Navigate to="/" replace />
          } 
        />
        <Route 
          path="/add-project" 
          element={
            isSignedIn ? (
              isFirstTime ? <Navigate to="/profile-setup" replace /> : <AddProject />
            ) : <Navigate to="/" replace />
          } 
        />
        <Route 
          path="/my-projects" 
          element={
            isSignedIn ? (
              isFirstTime ? <Navigate to="/profile-setup" replace /> : <MyProjects />
            ) : <Navigate to="/" replace />
          } 
        />
        
        {/* Catch all - redirect based on auth state */}
        <Route 
          path="*" 
          element={
            isSignedIn ? (
              isFirstTime ? <Navigate to="/profile-setup" replace /> : <Navigate to="/dashboard" replace />
            ) : <Navigate to="/" replace />
          } 
        />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <UserProvider>
      <AppRoutes />
    </UserProvider>
  )
}

export default App 