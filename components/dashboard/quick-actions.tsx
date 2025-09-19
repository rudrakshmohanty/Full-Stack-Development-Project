import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, Search, Share, Settings } from "lucide-react"
import Link from "next/link"

const actions = [
  {
    title: "Upload Credential",
    description: "Add a new credential to your collection",
    icon: Upload,
    href: "/dashboard/upload",
    color: "text-primary",
  },
  {
    title: "Verify Credential",
    description: "Check the authenticity of a credential",
    icon: Search,
    href: "/verification",
    color: "text-green-500",
  },
  {
    title: "Share Credential",
    description: "Generate a shareable verification link",
    icon: Share,
    href: "/dashboard/credentials",
    color: "text-blue-500",
  },
  {
    title: "Account Settings",
    description: "Manage your profile and preferences",
    icon: Settings,
    href: "/dashboard/profile",
    color: "text-purple-500",
  },
]

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks and shortcuts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {actions.map((action, index) => (
            <Button key={index} variant="ghost" className="w-full justify-start h-auto p-4" asChild>
              <Link href={action.href}>
                <action.icon className={`size-5 mr-3 ${action.color}`} />
                <div className="text-left">
                  <div className="font-medium">{action.title}</div>
                  <div className="text-sm text-muted-foreground">{action.description}</div>
                </div>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
