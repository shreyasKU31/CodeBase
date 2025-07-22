import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ArrowLeft, Heart, MessageCircle, ExternalLink, Github, Globe, Youtube } from 'lucide-react'
import LoadingSpinner from '@/components/LoadingSpinner'

const ProjectDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isSignedIn, isLoaded, session } = useAuth()
  const [project, setProject] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)

  // Debug authentication state
  useEffect(() => {
    console.log('Auth state:', { isSignedIn, isLoaded, hasUser: !!user })
  }, [isSignedIn, isLoaded, user])

  useEffect(() => {
    fetchProject()
    fetchComments()
  }, [id])

  const fetchProject = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/projects/${id}`)
      if (response.ok) {
        const data = await response.json()
        console.log('Project data:', data)
        setProject(data)
      } else {
        navigate('/dashboard')
      }
    } catch (error) {
      console.error('Error fetching project:', error)
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/projects/${id}/comments`)
      if (response.ok) {
        const data = await response.json()
        setComments(data)
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }

  const handleLike = async () => {
    if (!isSignedIn || !session) {
      console.log('User not signed in or session not available')
      return
    }

    try {
      console.log('Attempting to like project...')
      const token = await session.getToken()
      
      if (!token) {
        console.error('No session token available for like')
        return
      }
      console.log('Token obtained:', !!token)
      
      const response = await fetch(`http://localhost:5000/api/projects/${id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      console.log('Like response status:', response.status)
      
      if (response.ok) {
        // Update the project like count
        setProject(prev => ({
          ...prev,
          likeCount: (prev.likeCount || 0) + 1
        }))
        console.log('Project liked successfully')
      } else {
        const errorData = await response.json()
        console.error('Like failed:', errorData)
      }
    } catch (error) {
      console.error('Error liking project:', error)
    }
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!commentText.trim() || !isSignedIn || !session) {
      console.log('Cannot comment:', { 
        hasText: !!commentText.trim(), 
        isSignedIn, 
        hasSession: !!session 
      })
      return
    }

    setSubmittingComment(true)
    try {
      const token = await session.getToken()
      
      if (!token) {
        console.error('No session token available for comment')
        setSubmittingComment(false)
        return
      }
      console.log('Attempting to post comment...')
      console.log('Token obtained for comment:', !!token)
      
      const response = await fetch(`http://localhost:5000/api/projects/${id}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: commentText })
      })
      
      console.log('Comment response status:', response.status)
      
      if (response.ok) {
        const newComment = await response.json()
        setComments(prev => [newComment, ...prev])
        setCommentText('')
        console.log('Comment posted successfully')
      } else {
        const errorData = await response.json()
        console.error('Comment failed:', errorData)
      }
    } catch (error) {
      console.error('Error adding comment:', error)
    } finally {
      setSubmittingComment(false)
    }
  }

  if (loading || !isLoaded) {
    return <LoadingSpinner />
  }

  if (!project) {
    return <div>Project not found</div>
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
        {/* Project Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={project.author?.profile_picture} />
              <AvatarFallback>
                {project.author?.display_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-medium">{project.author?.display_name}</h2>
              <p className="text-sm text-muted-foreground">
                {project.author?.headline} • {project.author?.location}
              </p>
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">{project.title}</h1>
          <p className="text-xl text-muted-foreground mb-6">{project.description}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Project Images */}
            {project.images && project.images.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Project Gallery</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {project.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Project image ${index + 1}`}
                        className="w-full rounded-lg"
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Project Story */}
            <Card>
              <CardHeader>
                <CardTitle>The Story</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap">{project.story}</p>
                </div>
              </CardContent>
            </Card>

            {/* Comments */}
            <Card>
              <CardHeader>
                <CardTitle>Comments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add Comment */}
                {isSignedIn && (
                  <form onSubmit={handleComment} className="space-y-4">
                    <Input
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add a comment..."
                      disabled={submittingComment}
                    />
                    <Button type="submit" disabled={submittingComment || !commentText.trim()}>
                      {submittingComment ? 'Posting...' : 'Post Comment'}
                    </Button>
                  </form>
                )}

                {/* Comments List */}
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.users?.profile_picture} />
                        <AvatarFallback>
                          {comment.users?.display_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm">
                            {comment.users?.display_name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm">{comment.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Project Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Likes</span>
                  <span className="font-medium">{project.likeCount || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Comments</span>
                  <span className="font-medium">{comments.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Created</span>
                  <span className="font-medium">
                    {new Date(project.created_at).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Tech Stack */}
            {project.tech_stack && project.tech_stack.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Tech Stack</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {project.tech_stack.map((tech, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Project Links */}
            <Card>
              <CardHeader>
                <CardTitle>Project Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {project.github_url && (
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                      <Github className="h-4 w-4 mr-2" />
                      GitHub Repository
                    </a>
                  </Button>
                )}
                {project.live_url && (
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href={project.live_url} target="_blank" rel="noopener noreferrer">
                      <Globe className="h-4 w-4 mr-2" />
                      Live Demo
                    </a>
                  </Button>
                )}
                {project.figma_url && (
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href={project.figma_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Figma Design
                    </a>
                  </Button>
                )}
                {project.youtube_url && (
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href={project.youtube_url} target="_blank" rel="noopener noreferrer">
                      <Youtube className="h-4 w-4 mr-2" />
                      YouTube Demo
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="pt-6 space-y-3">
                <Button 
                  onClick={handleLike}
                  variant="outline" 
                  className="w-full"
                  disabled={!isSignedIn}
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Like Project
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    if (project.author?.username) {
                      navigate(`/user/${project.author.username}`)
                    } else {
                      console.error('No username available for author:', project.author)
                    }
                  }}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  View Profile
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectDetail 