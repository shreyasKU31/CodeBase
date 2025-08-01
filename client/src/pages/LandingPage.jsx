import { useAuth, SignInButton } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Code, Users, Zap, Award } from 'lucide-react'

const LandingPage = () => {
  const { isSignedIn } = useAuth()
  const navigate = useNavigate()

  const handleGetStarted = () => {
    if (isSignedIn) {
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Code className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">DevHance</span>
          </div>
          <div className="flex items-center space-x-4">
            {isSignedIn ? (
              <Button onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
            ) : (
              <SignInButton mode="modal">
                <Button>Sign In</Button>
              </SignInButton>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold mb-6">
          Showcase Your Projects,{' '}
          <span className="text-primary">Launch Your Career</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          DevHance is the essential platform where the next generation of tech talent 
          showcases their work and tells the complete story behind their code.
        </p>
        <div className="flex items-center justify-center space-x-4">
          <Button size="lg" onClick={handleGetStarted}>
            Get Started
          </Button>
          <Button variant="outline" size="lg" onClick={() => navigate('/dashboard')}>
            Explore Projects
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Why Choose DevHance?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Code className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Complete Project Stories</CardTitle>
              <CardDescription>
                Tell the full story behind your code - from problem to solution, 
                with embedded designs, demos, and technical details.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Community-Driven</CardTitle>
              <CardDescription>
                Get inspired by peers, receive feedback, and build your network 
                in a community of passionate developers.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Simple & Fast</CardTitle>
              <CardDescription>
                Create beautiful project case studies in minutes, not hours. 
                No complex setup or coding required.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/5 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Showcase Your Work?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of developers who are already building their portfolios on DevHance.
          </p>
          <Button size="lg" onClick={handleGetStarted}>
            Start Building Your Portfolio
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 DevHance. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage 