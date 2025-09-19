import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Shield, Search, CheckCircle } from "lucide-react"

const steps = [
  {
    step: "01",
    icon: Upload,
    title: "Upload Credential",
    description:
      "Securely upload your credential image through our free encrypted interface. The image is processed and stored with advanced encryption.",
  },
  {
    step: "02",
    icon: Shield,
    title: "Blockchain Storage",
    description:
      "Credential metadata is hashed and stored immutably on the blockchain for free, creating a tamper-proof record with unique verification code.",
  },
  {
    step: "03",
    icon: Search,
    title: "AI Verification",
    description:
      "Our free AI model analyzes and compares images for authenticity verification with advanced machine learning algorithms.",
  },
  {
    step: "04",
    icon: CheckCircle,
    title: "Instant Results",
    description:
      "Receive immediate verification results with confidence scores, detailed reports, and shareable verification certificates - all free.",
  },
]

export function HowItWorks() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-playfair font-bold text-balance mb-6">How It Works</h2>
          <p className="text-xl text-muted-foreground text-balance max-w-3xl mx-auto">
            Our free streamlined process ensures secure, fast, and reliable credential verification in just four simple
            steps - no cost involved.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <Card
              key={index}
              className="relative group hover:shadow-lg hover:shadow-primary/10 transition-all duration-300"
            >
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 relative">
                  <div className="size-16 rounded-full bg-gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <step.icon className="size-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    {step.step}
                  </div>
                </div>
                <CardTitle className="text-xl font-playfair">{step.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-base leading-relaxed">{step.description}</CardDescription>
              </CardContent>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary to-accent transform -translate-y-1/2" />
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
