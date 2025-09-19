import { RegisterForm } from "@/components/auth/register-form"
import { FloatingShapes } from "@/components/ui/floating-shapes"
import Link from "next/link"
import { Shield } from "lucide-react"

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-dark relative overflow-hidden flex items-center justify-center p-4">
      <FloatingShapes />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-2xl">
            <Shield className="size-8 text-primary" />
            <span className="font-playfair">BlockCreds</span>
          </Link>
          <p className="text-muted-foreground mt-2">Create your account</p>
        </div>

        <RegisterForm />

        <div className="text-center mt-6">
          <p className="text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
