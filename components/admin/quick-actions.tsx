"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserPlusIcon, DocumentPlusIcon, CogIcon, ShieldCheckIcon } from "@heroicons/react/24/outline"

const actions = [
  {
    name: "Add New User",
    description: "Create a new user account",
    icon: UserPlusIcon,
    href: "/admin/users/new",
  },
  {
    name: "System Settings",
    description: "Configure platform settings",
    icon: CogIcon,
    href: "/admin/settings",
  },
  {
    name: "Security Audit",
    description: "Run security diagnostics",
    icon: ShieldCheckIcon,
    href: "/admin/security",
  },
  {
    name: "Generate Report",
    description: "Create system report",
    icon: DocumentPlusIcon,
    href: "/admin/reports",
  },
]

export function QuickActions() {
  return (
    <Card className="bg-gray-800/50 border-purple-500/20 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>

      <div className="space-y-3">
        {actions.map((action) => (
          <Button key={action.name} variant="ghost" className="w-full justify-start h-auto p-3 hover:bg-purple-500/10">
            <action.icon className="h-5 w-5 text-purple-400 mr-3" />
            <div className="text-left">
              <p className="text-sm font-medium text-white">{action.name}</p>
              <p className="text-xs text-gray-400">{action.description}</p>
            </div>
          </Button>
        ))}
      </div>
    </Card>
  )
}
