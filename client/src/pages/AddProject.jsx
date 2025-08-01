import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, X, Upload } from 'lucide-react'
import LoadingSpinner from '@/components/LoadingSpinner'

const AddProject = () => {
  const { user, isLoaded, isSignedIn } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    story: '',
    techStack: '',
    githubUrl: '',
    liveUrl: '',
    figmaUrl: '',
    youtubeUrl: '',
    tags: ''
  })
  const [images, setImages] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])

  // Show loading spinner while Clerk is loading
  if (!isLoaded) {
    return <LoadingSpinner />
  }

  // If user is signed in but user object is not available, show a message
  if (isSignedIn && !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading your profile...</h2>
          <p className="text-muted-foreground mb-4">Please wait while we set up your account</p>
          <LoadingSpinner />
        </div>
      </div>
    )
  }



  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    setImages(prev => [...prev, ...files])
    
    // Create previews
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!user) {
      alert('Please sign in to create a project')
      return
    }
    
    setLoading(true)

    try {
      const token = await user.getToken()
      const formDataToSend = new FormData()
      
      // Add form fields
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          if (key === 'techStack' || key === 'tags') {
            // Convert comma-separated strings to arrays
            const array = formData[key].split(',').map(item => item.trim()).filter(item => item)
            formDataToSend.append(key, JSON.stringify(array))
          } else {
            formDataToSend.append(key, formData[key])
          }
        }
      })
      
      // Add images
      images.forEach(image => {
        formDataToSend.append('images', image)
      })

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      })

      if (response.ok) {
        const project = await response.json()
        navigate(`/project/${project.id}`)
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to create project')
      }
    } catch (error) {
      console.error('Error creating project:', error)
      alert('Failed to create project')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Add New Project</h1>
          <p className="text-muted-foreground">
            Create a compelling case study for your project
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Provide the essential details about your project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Project Title *
                </label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter your project title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Short Description *
                </label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Brief description of your project"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Project Story *
                </label>
                <Textarea
                  name="story"
                  value={formData.story}
                  onChange={handleInputChange}
                  placeholder="Tell the complete story behind your project. What problem did you solve? What challenges did you face? What was your approach?"
                  rows={6}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Project Images</CardTitle>
              <CardDescription>
                Upload images to showcase your project (first image will be the thumbnail)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                <label className="flex flex-col items-center cursor-pointer">
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">
                    Click to upload images
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>

              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Technical Details */}
          <Card>
            <CardHeader>
              <CardTitle>Technical Details</CardTitle>
              <CardDescription>
                Share the technical aspects of your project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tech Stack
                </label>
                <Input
                  name="techStack"
                  value={formData.techStack}
                  onChange={handleInputChange}
                  placeholder="React, Node.js, PostgreSQL (comma-separated)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Tags
                </label>
                <Input
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="web-app, portfolio, fullstack (comma-separated)"
                />
              </div>
            </CardContent>
          </Card>

          {/* Links */}
          <Card>
            <CardHeader>
              <CardTitle>Project Links</CardTitle>
              <CardDescription>
                Add links to your project resources
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  GitHub Repository
                </label>
                <Input
                  name="githubUrl"
                  value={formData.githubUrl}
                  onChange={handleInputChange}
                  placeholder="https://github.com/username/repository"
                  type="url"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Live Demo
                </label>
                <Input
                  name="liveUrl"
                  value={formData.liveUrl}
                  onChange={handleInputChange}
                  placeholder="https://your-project.com"
                  type="url"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Figma Design
                </label>
                <Input
                  name="figmaUrl"
                  value={formData.figmaUrl}
                  onChange={handleInputChange}
                  placeholder="https://figma.com/file/..."
                  type="url"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  YouTube Demo
                </label>
                <Input
                  name="youtubeUrl"
                  value={formData.youtubeUrl}
                  onChange={handleInputChange}
                  placeholder="https://youtube.com/watch?v=..."
                  type="url"
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <LoadingSpinner /> : 'Create Project'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddProject 