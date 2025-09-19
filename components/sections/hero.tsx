import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, Zap, Lock } from "lucide-react"
import Link from "next/link"

export function Hero() {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 bg-gradient-hero opacity-80" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/30 border border-primary/50 text-white text-sm font-medium mb-8 backdrop-blur-md">
            <Shield className="size-4" />
            Blockchain-Powered Security
          </div>

          <h1 className="text-6xl md:text-8xl font-playfair font-bold text-balance mb-8 text-white leading-tight">
            Free Credential
            <span className="block bg-gradient-to-r from-primary via-accent to-chart-3 bg-clip-text text-transparent">
              Verification
            </span>
            <span className="block text-5xl md:text-6xl">with AI</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-gray-200 text-balance mb-12 leading-relaxed max-w-3xl mx-auto">
            Free blockchain-based platform that combines immutable storage with AI-powered image verification for
            ultimate credential security and authenticity - no cost, no subscriptions.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
            <Button
              size="lg"
              className="text-lg px-10 py-5 h-auto animate-pulse-glow bg-gradient-primary hover:scale-105 transition-all duration-300 text-white"
              asChild
            >
              <Link href="/register">
                Start Verifying <ArrowRight className="size-5 ml-2" />
              </Link>
            </Button>
            {/* Removed Try Demo button */}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 text-sm">
            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-card/60 backdrop-blur-md border border-primary/20">
              <Lock className="size-5 text-primary" />
              <span className="text-white font-medium">Blockchain Security</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-card/60 backdrop-blur-md border border-accent/20">
              <Zap className="size-5 text-accent" />
              <span className="text-white font-medium">AI-Powered Verification</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-card/60 backdrop-blur-md border border-chart-3/20">
              <Shield className="size-5 text-chart-3" />
              <span className="text-white font-medium">Immutable Records</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
