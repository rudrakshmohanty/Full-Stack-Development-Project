import { Button } from "@/components/ui/button"
import { ArrowRight, Shield } from "lucide-react"
import Link from "next/link"

export function CTA() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <div className="bg-gradient-primary rounded-3xl p-12 md:p-16 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 left-4 size-32 rounded-full bg-white/20 animate-float" />
            <div
              className="absolute bottom-4 right-4 size-24 rounded-full bg-white/20 animate-float"
              style={{ animationDelay: "2s" }}
            />
            <div
              className="absolute top-1/2 left-1/2 size-40 rounded-full bg-white/10 animate-float"
              style={{ animationDelay: "4s" }}
            />
          </div>

          <div className="relative z-10">
            <Shield className="size-16 text-white mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-playfair font-bold text-white text-balance mb-6">
              Ready to Secure Your Credentials for Free?
            </h2>
            <p className="text-xl text-white/90 text-balance mb-8 leading-relaxed">
              Join thousands of organizations already using BlockCreds for free, secure, AI-powered credential
              verification - no cost, no subscriptions.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {/* Removed Get Started and Try Demo buttons */}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
