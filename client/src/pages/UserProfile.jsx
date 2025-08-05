import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ArrowLeft, Github, Linkedin, Globe, ExternalLink } from 'lucide-react'
import LoadingSpinner from '@/components/LoadingSpinner'

const UserProfile = () => {
  const { username } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserProfile()
    fetchUserProjects()
  }, [username])

  const fetchUserProfile = async () => {
    if (!username) {
      setLoading(false)
      navigate('/dashboard')
      return
    }

    try {
      const response = await fetch(`http://localhost:5000/api/users/${username}`)
      if (response.ok) {
        const data = await response.json()
        setUser(data)
      } else {
        navigate('/dashboard')
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const fetchUserProjects = async () => {
    if (!username) return

    try {
      const response = await fetch(`http://localhost:5000/api/users/${username}/projects`)
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
      }
    } catch (error) {
      console.error('Error fetching user projects:', error)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return <div>User not found</div>
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* User Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-6 mb-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.profile_picture} />
              <AvatarFallback className="text-2xl">
                {user.display_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold mb-2">{user.display_name}</h1>
              {user.headline && (
                <p className="text-xl text-muted-foreground mb-2">{user.headline}</p>
              )}
              {user.location && (
                <p className="text-muted-foreground mb-4">{user.location}</p>
              )}
              <div className="flex space-x-3">
                {user.github_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={user.github_url} target="_blank" rel="noopener noreferrer">
                      <Github className="h-4 w-4 mr-2" />
                      GitHub
                    </a>
                  </Button>
                )}
                {user.linkedin_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={user.linkedin_url} target="_blank" rel="noopener noreferrer">
                      <Linkedin className="h-4 w-4 mr-2" />
                      LinkedIn
                    </a>
                  </Button>
                )}
                {user.website_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={user.website_url} target="_blank" rel="noopener noreferrer">
                      <Globe className="h-4 w-4 mr-2" />
                      Website
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
          {user.bio && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground">{user.bio}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* User Projects */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Projects</h2>
          {projects.length > 0 ? (
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
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">No projects found.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserProfile 