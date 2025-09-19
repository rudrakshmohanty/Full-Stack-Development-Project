import { Hero } from "@/components/sections/hero"
import { Features } from "@/components/sections/features"
import { HowItWorks } from "@/components/sections/how-it-works"
import { CTA } from "@/components/sections/cta"
import { Navigation } from "@/components/navigation"
import { FloatingShapes } from "@/components/ui/floating-shapes"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-dark relative overflow-hidden">
      <FloatingShapes />
      <Navigation />
      <main className="relative z-10">
        <Hero />
        <Features />
        <HowItWorks />
        <CTA />
      </main>

      <footer className="relative z-10 py-12 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400">
            © 2024 BlockCreds. All rights reserved. Free blockchain credential verification for everyone.
          </p>
        </div>
      </footer>
    </div>
  )
}
