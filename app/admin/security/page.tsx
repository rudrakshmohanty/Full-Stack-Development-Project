"use client"

import { AdminLayout } from "@/components/admin/admin-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExclamationTriangleIcon, ShieldCheckIcon, EyeIcon, LockClosedIcon } from "@heroicons/react/24/outline"

const securityLogs = [
  {
    id: 1,
    event: "Failed login attempt",
    user: "unknown@example.com",
    ip: "192.168.1.100",
    timestamp: "2024-01-15 14:30:22",
    severity: "high",
    status: "blocked",
  },
  {
    id: 2,
    event: "Admin login",
    user: "admin@blockcreds.com",
    ip: "10.0.0.1",
    timestamp: "2024-01-15 14:25:15",
    severity: "medium",
    status: "success",
  },
  {
    id: 3,
    event: "Suspicious file upload",
    user: "user@example.com",
    ip: "203.0.113.1",
    timestamp: "2024-01-15 14:20:45",
    severity: "high",
    status: "quarantined",
  },
]

const vulnerabilities = [
  {
    id: 1,
    title: "Outdated SSL Certificate",
    description: "SSL certificate expires in 30 days",
    severity: "medium",
    status: "pending",
  },
  {
    id: 2,
    title: "Weak Password Policy",
    description: "Some users have weak passwords",
    severity: "low",
    status: "resolved",
  },
]

export default function AdminSecurity() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Security Center</h1>
          <p className="text-gray-400">Monitor security events and manage platform security</p>
        </div>

        {/* Security Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gray-800/50 border-purple-500/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Security Score</p>
                <p className="text-2xl font-bold text-green-400">92/100</p>
              </div>
              <ShieldCheckIcon className="h-8 w-8 text-green-400" />
            </div>
          </Card>

          <Card className="bg-gray-800/50 border-purple-500/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Active Threats</p>
                <p className="text-2xl font-bold text-red-400">3</p>
              </div>
              <ExclamationTriangleIcon className="h-8 w-8 text-red-400" />
            </div>
          </Card>

          <Card className="bg-gray-800/50 border-purple-500/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Failed Logins (24h)</p>
                <p className="text-2xl font-bold text-yellow-400">12</p>
              </div>
              <LockClosedIcon className="h-8 w-8 text-yellow-400" />
            </div>
          </Card>

          <Card className="bg-gray-800/50 border-purple-500/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Blocked IPs</p>
                <p className="text-2xl font-bold text-blue-400">8</p>
              </div>
              <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">!</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Security Logs */}
        <Card className="bg-gray-800/50 border-purple-500/20">
          <div className="p-6 border-b border-purple-500/20">
            <h3 className="text-lg font-semibold text-white">Security Logs</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-purple-500/20">
                  <th className="text-left p-4 text-sm font-medium text-gray-300">Event</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-300">User</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-300">IP Address</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-300">Severity</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-300">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-300">Timestamp</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {securityLogs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                    <td className="p-4 text-sm text-white">{log.event}</td>
                    <td className="p-4 text-sm text-gray-300">{log.user}</td>
                    <td className="p-4 text-sm text-gray-300">{log.ip}</td>
                    <td className="p-4">
                      <Badge
                        variant={
                          log.severity === "high" ? "destructive" : log.severity === "medium" ? "default" : "secondary"
                        }
                      >
                        {log.severity}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge
                        variant={
                          log.status === "success" ? "default" : log.status === "blocked" ? "destructive" : "secondary"
                        }
                      >
                        {log.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm text-gray-400">{log.timestamp}</td>
                    <td className="p-4">
                      <Button variant="ghost" size="sm">
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Vulnerabilities */}
        <Card className="bg-gray-800/50 border-purple-500/20">
          <div className="p-6 border-b border-purple-500/20">
            <h3 className="text-lg font-semibold text-white">Vulnerability Assessment</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {vulnerabilities.map((vuln) => (
                <div key={vuln.id} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <ExclamationTriangleIcon
                      className={`h-5 w-5 ${vuln.severity === "high" ? "text-red-400" : vuln.severity === "medium" ? "text-yellow-400" : "text-blue-400"}`}
                    />
                    <div>
                      <p className="text-sm font-medium text-white">{vuln.title}</p>
                      <p className="text-xs text-gray-400">{vuln.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={
                        vuln.severity === "high" ? "destructive" : vuln.severity === "medium" ? "default" : "secondary"
                      }
                    >
                      {vuln.severity}
                    </Badge>
                    <Badge variant={vuln.status === "resolved" ? "default" : "secondary"}>{vuln.status}</Badge>
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </AdminLayout>
  )
}
