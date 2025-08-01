import { useState, useEffect } from 'react'
import { useAuth, UserButton } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Plus, Heart, MessageCircle, ExternalLink } from 'lucide-react'
import LoadingSpinner from '@/components/LoadingSpinner'


const Dashboard = () => {
  const { user, isLoaded, isSignedIn } = useAuth()
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState(null)

  useEffect(() => {
    fetchProjects()
  }, [])

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      checkUserProfile()
    }
  }, [isLoaded, isSignedIn, user])

  // Handle case where user is signed in but user object is not available
  useEffect(() => {
    if (isLoaded && isSignedIn && !user) {
      // Wait a bit for the user object to load
      const timer = setTimeout(() => {
        if (isSignedIn && !user) {
          // Force a re-render to check again
          setProjects(prev => [...prev])
        }
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [isLoaded, isSignedIn, user])





  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects/discover')
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkUserProfile = async () => {
    if (!user) {
      return
    }
    
    try {
      const token = await user.getToken()
      const response = await fetch('/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const profile = await response.json()
        setUserProfile(profile)
        if (!profile.is_profile_complete) {
          navigate('/profile-setup')
        }
      } else if (response.status === 404) {
        navigate('/profile-setup')
      }
    } catch (error) {
      console.error('Error checking profile:', error)
    }
  }

  const handleLike = async (projectId) => {
    if (!user) {
      return
    }
    
    try {
      const token = await user.getToken()
      const response = await fetch(`/api/projects/${projectId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        // Update the project in the list
        setProjects(prev => prev.map(project => {
          if (project.id === projectId) {
            return {
              ...project,
              likeCount: project.likeCount + 1
            }
          }
          return project
        }))
      }
    } catch (error) {
      console.error('Error liking project:', error)
    }
  }

  // Show loading spinner while Clerk is loading or projects are loading
  if (!isLoaded || loading) {
    return <LoadingSpinner />
  }

  // If user is signed in but user object is not available, show a message instead of infinite loading
  if (isSignedIn && !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading your profile...</h2>
          <p className="text-muted-foreground mb-4">This might take a moment</p>
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary">DevHance</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button onClick={() => navigate('/add-project')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Project
            </Button>
            <UserButton />
          </div>
        </div>
      </nav>

             {/* Main Content */}
               <div className="container mx-auto px-4 py-8">
         
         <div className="flex items-center justify-between mb-8">
           <h1 className="text-3xl font-bold">Discover Projects</h1>
           <div className="flex space-x-2">
             <Button variant="outline" onClick={() => navigate('/my-projects')}>
               My Projects
             </Button>
           </div>
         </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <div 
                className="aspect-video bg-muted rounded-t-lg overflow-hidden"
                onClick={() => navigate(`/project/${project.id}`)}
              >
                {project.thumbnail ? (
                  <img 
                    src={project.thumbnail} 
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    No Image
                  </div>
                )}
              </div>
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={project.users?.profile_picture} />
                    <AvatarFallback>
                      {project.users?.display_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">
                    {project.users?.display_name || 'Unknown'}
                  </span>
                </div>
                <CardTitle className="text-lg">{project.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {project.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleLike(project.id)}
                      className="flex items-center space-x-1 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Heart className="h-4 w-4" />
                      <span className="text-sm">{project.likeCount || 0}</span>
                    </button>
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <MessageCircle className="h-4 w-4" />
                      <span className="text-sm">{project.commentCount || 0}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/project/${project.id}`)}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {projects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No projects found.</p>
            <Button 
              className="mt-4" 
              onClick={() => navigate('/add-project')}
            >
              Be the first to add a project!
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard 