import { useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '@/hooks/useUser'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Upload, User } from 'lucide-react'
import LoadingSpinner from '@/components/LoadingSpinner'

const ProfileSetup = () => {
  const { user: clerkUser, isLoaded, session } = useAuth()
  const { user, syncUserToSupabase } = useUser()
  const navigate = useNavigate()
  
  // Show loading if Clerk is not loaded yet
  if (!isLoaded) {
    return <LoadingSpinner />
  }
  
  // Show loading if session is not available yet (common after sign-up)
  if (!session || !clerkUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Setting Up Your Profile</CardTitle>
            <CardDescription>
              Please wait while we prepare your account...
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <LoadingSpinner />
          </CardContent>
        </Card>
      </div>
    )
  }
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    displayName: (clerkUser?.firstName && clerkUser?.lastName) 
      ? `${clerkUser.firstName} ${clerkUser.lastName}` 
      : clerkUser?.firstName || clerkUser?.lastName || '',
    username: clerkUser?.username || clerkUser?.primaryEmailAddress?.emailAddress?.split('@')[0] || '',
    headline: '',
    location: '',
    bio: '',
    githubUrl: '',
    linkedinUrl: '',
    websiteUrl: ''
  })
  const [profilePicture, setProfilePicture] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setProfilePicture(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.displayName.trim() || !formData.username.trim()) {
      alert('Display Name and Username are required fields')
      return
    }
    
    // Check if session is available
    if (!session) {
      alert('Please wait for your session to load. This usually takes a few seconds after signing up.')
      return
    }
    
    setLoading(true)

    try {
      // Prepare user data for Supabase
      const userData = {
        display_name: formData.displayName.trim(),
        username: formData.username.trim(),
        headline: formData.headline.trim(),
        location: formData.location.trim(),
        bio: formData.bio.trim(),
        github_url: formData.githubUrl.trim(),
        linkedin_url: formData.linkedinUrl.trim(),
        website_url: formData.websiteUrl.trim(),
        email: clerkUser?.primaryEmailAddress?.emailAddress || ''
      }

      // If profile picture is selected, convert to base64
      if (profilePicture) {
        const base64 = await new Promise((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result)
          reader.readAsDataURL(profilePicture)
        })
        userData.profile_picture = base64
      }

      // Sync user data to Supabase
      const result = await syncUserToSupabase(userData)

      if (result.success) {
        navigate('/dashboard')
      } else {
        console.error('Profile sync failed:', result.error)
        alert('Failed to create profile: ' + (result.error?.message || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error creating profile:', error)
      alert('Failed to create profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <CardDescription>
            Profile setup is required to access DevHance. Please complete your profile to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={previewUrl} />
                  <AvatarFallback>
                    <User className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors">
                  <Upload className="h-4 w-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-sm text-muted-foreground">
                Upload a profile picture (optional)
              </p>
            </div>

            {/* Required Fields */}
            <div className="space-y-4">
              <div className="bg-muted p-3 rounded-lg mb-4">
                <p className="text-sm text-muted-foreground">
                  <strong>Required:</strong> Display Name and Username are mandatory to complete your profile setup.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Display Name *
                </label>
                <Input
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  placeholder="Your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Username *
                </label>
                <Input
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Choose a unique username"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Headline
                </label>
                <Input
                  name="headline"
                  value={formData.headline}
                  onChange={handleInputChange}
                  placeholder="e.g., Full Stack Developer, UI/UX Designer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Location
                </label>
                <Input
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., San Francisco, CA"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Bio
                </label>
                <Textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself..."
                  rows={3}
                />
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Social Links (Optional)</h3>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  GitHub URL
                </label>
                <Input
                  name="githubUrl"
                  value={formData.githubUrl}
                  onChange={handleInputChange}
                  placeholder="https://github.com/yourusername"
                  type="url"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  LinkedIn URL
                </label>
                <Input
                  name="linkedinUrl"
                  value={formData.linkedinUrl}
                  onChange={handleInputChange}
                  placeholder="https://linkedin.com/in/yourusername"
                  type="url"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Website URL
                </label>
                <Input
                  name="websiteUrl"
                  value={formData.websiteUrl}
                  onChange={handleInputChange}
                  placeholder="https://yourwebsite.com"
                  type="url"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard')}
              >
                Skip for now
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? <LoadingSpinner /> : 'Complete Profile'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default ProfileSetup 