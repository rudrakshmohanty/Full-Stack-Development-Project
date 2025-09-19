import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const stats = [
  {
    label: "Monthly Uploads",
    current: 8,
    limit: 10,
    color: "bg-primary",
  },
  {
    label: "Verification Success Rate",
    current: 92,
    limit: 100,
    color: "bg-green-500",
  },
  {
    label: "Storage Used",
    current: 245,
    limit: 500,
    color: "bg-blue-500",
    unit: "MB",
  },
]

export function VerificationStats() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Usage Statistics</CardTitle>
        <CardDescription>Your current usage and limits</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {stats.map((stat, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{stat.label}</span>
                <span className="text-muted-foreground">
                  {stat.current}
                  {stat.unit || ""} / {stat.limit}
                  {stat.unit || ""}
                </span>
              </div>
              <Progress value={(stat.current / stat.limit) * 100} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
