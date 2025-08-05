import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Edit, Trash2, ExternalLink } from 'lucide-react'
import LoadingSpinner from '@/components/LoadingSpinner'

const MyProjects = () => {
  const { user, isLoaded, isSignedIn, session } = useAuth()
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isLoaded && isSignedIn && session) {
      fetchMyProjects()
    } else if (isLoaded && isSignedIn && !session) {
      // If session is not available after 5 seconds, skip fetching
      const timer = setTimeout(() => {
        if (!session) {
          console.warn('Session not available, skipping project fetch')
          setLoading(false)
        }
      }, 5000)
      
      return () => clearTimeout(timer)
    } else if (isLoaded && !isSignedIn) {
      navigate('/')
    }
  }, [isLoaded, isSignedIn, session, navigate])

  const fetchMyProjects = async () => {
    if (!session) {
      console.warn('Session not available, cannot fetch projects')
      setLoading(false)
      return
    }

    try {
      const token = await session.getToken()
      
      if (!token) {
        console.error('No session token available for fetching projects')
        setLoading(false)
        return
      }
      const response = await fetch('http://localhost:5000/api/projects/my-projects', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
      } else {
        console.error('Failed to fetch projects:', response.status)
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProject = async (projectId) => {
    if (!session) {
      alert('Please wait for your session to load before deleting projects')
      return
    }

    if (!confirm('Are you sure you want to delete this project?')) return

    try {
      const token = await session.getToken()
      
      if (!token) {
        console.error('No session token available for deleting project')
        return
      }
      const response = await fetch(`http://localhost:5000/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        setProjects(prev => prev.filter(project => project.id !== projectId))
      } else {
        alert('Failed to delete project')
      }
    } catch (error) {
      console.error('Error deleting project:', error)
      alert('Failed to delete project')
    }
  }

  // Show loading while Clerk is loading or projects are loading
  if (!isLoaded || loading) {
    return <LoadingSpinner />
  }

  // If not signed in, redirect to landing page
  if (!isSignedIn) {
    navigate('/')
    return null
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
            <Button onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">My Projects</h1>
          <Button onClick={() => navigate('/add-project')}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Project
          </Button>
        </div>

        {/* Projects Grid */}
        {projects.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <div 
                  className="aspect-video bg-muted rounded-t-lg overflow-hidden cursor-pointer"
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
                  <CardTitle className="text-lg">{project.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {project.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-muted-foreground">
                        {project.likeCount || 0} likes
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {project.commentCount || 0} comments
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/project/${project.id}`)}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/edit-project/${project.id}`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteProject(project.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <div className="mb-4">
                <Plus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No projects yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start building your portfolio by adding your first project
                </p>
                <Button onClick={() => navigate('/add-project')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Project
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default MyProjects 