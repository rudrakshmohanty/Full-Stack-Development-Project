"use client"

import { Card } from "@/components/ui/card"
import { UserIcon, DocumentCheckIcon, ShieldCheckIcon, CubeIcon } from "@heroicons/react/24/outline"

const activities = [
  {
    id: 1,
    type: "user_registered",
    message: "New user registered",
    user: "john@example.com",
    timestamp: "2 minutes ago",
    icon: UserIcon,
  },
  {
    id: 2,
    type: "credential_uploaded",
    message: "Credential uploaded",
    user: "jane@example.com",
    timestamp: "5 minutes ago",
    icon: DocumentCheckIcon,
  },
  {
    id: 3,
    type: "verification_completed",
    message: "Verification completed",
    user: "System",
    timestamp: "8 minutes ago",
    icon: ShieldCheckIcon,
  },
  {
    id: 4,
    type: "blockchain_transaction",
    message: "Blockchain transaction",
    user: "System",
    timestamp: "12 minutes ago",
    icon: CubeIcon,
  },
]

export function RecentActivity() {
  return (
    <Card className="bg-gray-800/50 border-purple-500/20 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <activity.icon className="h-5 w-5 text-purple-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white">{activity.message}</p>
              <p className="text-xs text-gray-400">
                {activity.user} • {activity.timestamp}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
