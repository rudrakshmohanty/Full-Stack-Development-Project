import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Zap, Database, Eye, Lock, Cpu } from "lucide-react"

const features = [
  {
    icon: Shield,
    title: "Blockchain Security",
    description:
      "Free immutable credential storage on blockchain with cryptographic hashing for ultimate security and tamper-proof verification.",
  },
  {
    icon: Zap,
    title: "AI-Powered Verification",
    description:
      "Free advanced AI model integration for intelligent image comparison and credential authenticity verification.",
  },
  {
    icon: Database,
    title: "Secure Storage",
    description:
      "Free encrypted credential storage with database integration and advanced encryption for data protection.",
  },
  {
    icon: Eye,
    title: "Real-time Verification",
    description: "Free instant credential verification with confidence scoring and detailed authenticity reports.",
  },
  {
    icon: Lock,
    title: "End-to-End Encryption",
    description: "Free complete data encryption from upload to verification with secure key management and rotation.",
  },
  {
    icon: Cpu,
    title: "Smart Contracts",
    description:
      "Free automated verification processes powered by blockchain smart contracts for trustless operations.",
  },
]

export function Features() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-playfair font-bold text-balance mb-6">
            Free Cutting-Edge Technology Stack
          </h2>
          <p className="text-xl text-muted-foreground text-balance max-w-3xl mx-auto">
            Our free platform combines the latest in blockchain, AI, and cryptographic technologies to deliver
            unparalleled credential verification security at no cost.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 border-border/50 hover:border-primary/30"
            >
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="size-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-playfair">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
