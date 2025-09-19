import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Shield, TrendingUp, Clock } from "lucide-react"

const stats = [
  {
    title: "Total Credentials",
    value: "24",
    change: "+3 this month",
    icon: FileText,
    color: "text-primary",
  },
  {
    title: "Verified Credentials",
    value: "22",
    change: "91.7% success rate",
    icon: Shield,
    color: "text-green-500",
  },
  {
    title: "Verifications",
    value: "156",
    change: "+12 this week",
    icon: TrendingUp,
    color: "text-blue-500",
  },
  {
    title: "Pending",
    value: "2",
    change: "Processing",
    icon: Clock,
    color: "text-yellow-500",
  },
]

export function DashboardOverview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card
          key={index}
          className="border-border/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <stat.icon className={`size-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-playfair">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
