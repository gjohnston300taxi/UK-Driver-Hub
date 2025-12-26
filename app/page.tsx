import { Button } from "@/components/ui/button"
import { Car, MapPin, Clock, Shield } from "lucide-react"
import { Header } from "@/components/header"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Header />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-taxi-yellow/10 border border-taxi-yellow/20 mb-6">
            <div className="h-2 w-2 rounded-full bg-taxi-yellow animate-pulse" />
            <span className="text-sm font-medium">Now Available in Your City</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Your Ride,{" "}
            <span className="text-taxi-yellow">On Demand</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Safe, reliable, and affordable transportation at your fingertips. 
            Book a ride in seconds and get where you need to go.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-taxi-yellow hover:bg-taxi-yellow/90 text-black font-semibold text-lg px-8">
              Book a Ride Now
              <Car className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-2 hover:border-taxi-yellow hover:text-taxi-yellow">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20 bg-white rounded-3xl shadow-sm">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Us</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience the best in modern transportation with our premium features
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<Clock className="h-8 w-8" />}
            title="Fast Pickup"
            description="Average wait time under 5 minutes. Get moving quickly."
          />
          <FeatureCard
            icon={<MapPin className="h-8 w-8" />}
            title="Track Your Ride"
            description="Real-time GPS tracking from pickup to destination."
          />
          <FeatureCard
            icon={<Shield className="h-8 w-8" />}
            title="Safe & Secure"
            description="All drivers verified. Your safety is our priority."
          />
          <FeatureCard
            icon={<Car className="h-8 w-8" />}
            title="Quality Fleet"
            description="Clean, comfortable vehicles maintained to high standards."
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-black to-slate-900 rounded-3xl p-12 md:p-16 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied riders. Download the app or sign up online today.
          </p>
          <Button size="lg" className="bg-taxi-yellow hover:bg-taxi-yellow/90 text-black font-semibold text-lg px-8">
            Create Your Account
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-slate-50">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-black flex items-center justify-center">
                  <Car className="h-5 w-5 text-taxi-yellow" />
                </div>
                <span className="font-bold">TaxiApp</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Modern transportation for the modern world.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-taxi-yellow transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-taxi-yellow transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-taxi-yellow transition-colors">Press</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-taxi-yellow transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-taxi-yellow transition-colors">Safety</a></li>
                <li><a href="#" className="hover:text-taxi-yellow transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-taxi-yellow transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-taxi-yellow transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-taxi-yellow transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            © 2024 TaxiApp. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="group p-6 rounded-xl border bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="h-14 w-14 rounded-lg bg-taxi-yellow/10 flex items-center justify-center mb-4 group-hover:bg-taxi-yellow/20 transition-colors">
        <div className="text-taxi-yellow">{icon}</div>
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
