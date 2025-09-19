import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Search, Cpu, CheckCircle } from "lucide-react"

const steps = [
  {
    icon: Upload,
    title: "Upload Image",
    description: "Upload the credential image you want to verify",
  },
  {
    icon: Search,
    title: "Enter Code",
    description: "Provide the verification code from the credential",
  },
  {
    icon: Cpu,
    title: "AI Analysis",
    description: "Our AI compares the image with blockchain records",
  },
  {
    icon: CheckCircle,
    title: "Get Results",
    description: "Receive instant verification with confidence score",
  },
]

export function VerificationSteps() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>How It Works</CardTitle>
        <CardDescription>Simple steps to verify any credential</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                <step.icon className="size-4 text-primary" />
              </div>
              <div>
                <h4 className="font-medium">{step.title}</h4>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
