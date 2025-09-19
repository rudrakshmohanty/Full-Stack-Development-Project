import { VerificationForm } from "@/components/verification/verification-form"
import { VerificationSteps } from "@/components/verification/verification-steps"
import { FloatingShapes } from "@/components/ui/floating-shapes"
import { Navigation } from "@/components/navigation"

export default function VerificationPage() {
  return (
    <div className="min-h-screen bg-gradient-dark relative overflow-hidden">
      <FloatingShapes />
      <Navigation />

      <main className="relative z-10 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-playfair font-bold text-balance mb-6">Verify Credentials</h1>
            <p className="text-xl text-muted-foreground text-balance max-w-3xl mx-auto">
              Instantly verify the authenticity of any credential using our AI-powered blockchain verification system
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <VerificationForm />
            </div>
            <div>
              <VerificationSteps />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
