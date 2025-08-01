import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import ProjectDetail from './pages/ProjectDetail'
import AddProject from './pages/AddProject'
import ProfileSetup from './pages/ProfileSetup'
import UserProfile from './pages/UserProfile'
import MyProjects from './pages/MyProjects'
import LoadingSpinner from './components/LoadingSpinner'

function App() {
  const { isLoaded, isSignedIn, user } = useAuth()

  if (!isLoaded) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-background">
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/project/:id" element={<ProjectDetail />} />
        <Route path="/user/:username" element={<UserProfile />} />
        
        {/* Protected routes */}
        <Route 
          path="/dashboard" 
          element={isSignedIn ? <Dashboard /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/profile-setup" 
          element={isSignedIn ? <ProfileSetup /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/add-project" 
          element={isSignedIn ? <AddProject /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/my-projects" 
          element={isSignedIn ? <MyProjects /> : <Navigate to="/" replace />} 
        />
        
        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App 