"use client"

import { Card } from "@/components/ui/card"
import { ChartBarIcon, ExclamationTriangleIcon, CheckCircleIcon } from "@heroicons/react/24/outline"

export function AdminOverview() {
  return (
    <div className="space-y-6">
      <Card className="bg-gray-800/50 border-purple-500/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">System Health</h3>
          <ChartBarIcon className="h-5 w-5 text-purple-400" />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="h-5 w-5 text-green-400" />
              <span className="text-gray-300">API Services</span>
            </div>
            <span className="text-green-400 text-sm font-medium">Operational</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="h-5 w-5 text-green-400" />
              <span className="text-gray-300">Database</span>
            </div>
            <span className="text-green-400 text-sm font-medium">Operational</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
              <span className="text-gray-300">Blockchain Network</span>
            </div>
            <span className="text-yellow-400 text-sm font-medium">High Latency</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="h-5 w-5 text-green-400" />
              <span className="text-gray-300">AI Processing</span>
            </div>
            <span className="text-green-400 text-sm font-medium">Operational</span>
          </div>
        </div>
      </Card>

      <Card className="bg-gray-800/50 border-purple-500/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Alerts</h3>

        <div className="space-y-3">
          <div className="flex items-start space-x-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-300 font-medium">High verification volume detected</p>
              <p className="text-xs text-gray-400 mt-1">2 minutes ago</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <CheckCircleIcon className="h-5 w-5 text-blue-400 mt-0.5" />
            <div>
              <p className="text-sm text-blue-300 font-medium">System backup completed successfully</p>
              <p className="text-xs text-gray-400 mt-1">1 hour ago</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
