import { LoginForm } from "@/components/auth/login-form"
import { FloatingShapes } from "@/components/ui/floating-shapes"
import Link from "next/link"
import { Shield } from "lucide-react"

export default function LoginPage() {
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
          <p className="text-muted-foreground mt-2">Sign in to your account</p>
        </div>

        <LoginForm />

        <div className="text-center mt-6">
          <p className="text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
