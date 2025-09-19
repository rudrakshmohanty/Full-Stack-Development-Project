"use client"

import { Card } from "@/components/ui/card"
import { UsersIcon, DocumentCheckIcon, ShieldCheckIcon, CubeIcon } from "@heroicons/react/24/outline"

const stats = [
  {
    name: "Total Users",
    value: "2,847",
    change: "+12%",
    changeType: "positive",
    icon: UsersIcon,
  },
  {
    name: "Credentials Stored",
    value: "15,234",
    change: "+8%",
    changeType: "positive",
    icon: DocumentCheckIcon,
  },
  {
    name: "Verifications Today",
    value: "342",
    change: "+23%",
    changeType: "positive",
    icon: ShieldCheckIcon,
  },
  {
    name: "Blockchain Transactions",
    value: "8,921",
    change: "+5%",
    changeType: "positive",
    icon: CubeIcon,
  },
]

export function SystemStats() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.name} className="bg-gray-800/50 border-purple-500/20 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <stat.icon className="h-8 w-8 text-purple-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-400 truncate">{stat.name}</dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-white">{stat.value}</div>
                  <div className="ml-2 flex items-baseline text-sm font-semibold text-green-400">{stat.change}</div>
                </dd>
              </dl>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
