import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock } from "lucide-react"

const recentVerifications = [
  {
    id: "CERT-001-2024",
    status: "verified",
    timestamp: "2 minutes ago",
    similarity: 95.8,
  },
  {
    id: "CERT-002-2024",
    status: "failed",
    timestamp: "15 minutes ago",
    similarity: 45.2,
  },
  {
    id: "CERT-003-2024",
    status: "verified",
    timestamp: "1 hour ago",
    similarity: 89.3,
  },
  {
    id: "CERT-004-2024",
    status: "processing",
    timestamp: "2 hours ago",
    similarity: null,
  },
]

export function RecentVerifications() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Verifications</CardTitle>
        <CardDescription>Latest verification attempts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentVerifications.map((verification) => (
            <div key={verification.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {verification.status === "verified" && <CheckCircle className="size-4 text-green-500" />}
                {verification.status === "failed" && <XCircle className="size-4 text-red-500" />}
                {verification.status === "processing" && <Clock className="size-4 text-yellow-500" />}
                <div>
                  <p className="text-sm font-medium">{verification.id}</p>
                  <p className="text-xs text-muted-foreground">{verification.timestamp}</p>
                </div>
              </div>
              <div className="text-right">
                <Badge
                  variant={
                    verification.status === "verified"
                      ? "default"
                      : verification.status === "failed"
                        ? "destructive"
                        : "secondary"
                  }
                  className={verification.status === "verified" ? "bg-green-500" : ""}
                >
                  {verification.status}
                </Badge>
                {verification.similarity && (
                  <p className="text-xs text-muted-foreground mt-1">{verification.similarity}%</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
