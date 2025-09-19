"use client"

import { AdminLayout } from "@/components/admin/admin-layout"
import { Card } from "@/components/ui/card"
import { ChartBarIcon, TrendingUpIcon, UsersIcon, DocumentCheckIcon } from "@heroicons/react/24/outline"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const usageData = [
  { month: "Jan", users: 1200, credentials: 2400, verifications: 1800 },
  { month: "Feb", users: 1400, credentials: 2800, verifications: 2100 },
  { month: "Mar", users: 1600, credentials: 3200, verifications: 2400 },
  { month: "Apr", users: 1800, credentials: 3600, verifications: 2700 },
  { month: "May", users: 2000, credentials: 4000, verifications: 3000 },
  { month: "Jun", users: 2200, credentials: 4400, verifications: 3300 },
]

const credentialTypes = [
  { name: "Education", value: 45, color: "#8B5CF6" },
  { name: "Professional", value: 30, color: "#06B6D4" },
  { name: "License", value: 15, color: "#10B981" },
  { name: "Other", value: 10, color: "#F59E0B" },
]

export default function AdminAnalytics() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
          <p className="text-gray-400">Comprehensive platform analytics and insights</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gray-800/50 border-purple-500/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Users</p>
                <p className="text-2xl font-bold text-white">2,847</p>
                <p className="text-sm text-green-400">+12% from last month</p>
              </div>
              <UsersIcon className="h-8 w-8 text-purple-400" />
            </div>
          </Card>

          <Card className="bg-gray-800/50 border-purple-500/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Credentials Issued</p>
                <p className="text-2xl font-bold text-white">15,234</p>
                <p className="text-sm text-green-400">+18% from last month</p>
              </div>
              <DocumentCheckIcon className="h-8 w-8 text-blue-400" />
            </div>
          </Card>

          <Card className="bg-gray-800/50 border-purple-500/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Verifications</p>
                <p className="text-2xl font-bold text-white">8,921</p>
                <p className="text-sm text-green-400">+8% from last month</p>
              </div>
              <ChartBarIcon className="h-8 w-8 text-green-400" />
            </div>
          </Card>

          <Card className="bg-gray-800/50 border-purple-500/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Success Rate</p>
                <p className="text-2xl font-bold text-white">94.2%</p>
                <p className="text-sm text-green-400">+2.1% from last month</p>
              </div>
              <TrendingUpIcon className="h-8 w-8 text-yellow-400" />
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-gray-800/50 border-purple-500/20 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Platform Growth</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={usageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #8B5CF6",
                    borderRadius: "8px",
                    color: "#FFFFFF",
                  }}
                />
                <Line type="monotone" dataKey="users" stroke="#8B5CF6" strokeWidth={2} />
                <Line type="monotone" dataKey="credentials" stroke="#06B6D4" strokeWidth={2} />
                <Line type="monotone" dataKey="verifications" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="bg-gray-800/50 border-purple-500/20 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Credential Types Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={credentialTypes}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {credentialTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #8B5CF6",
                    borderRadius: "8px",
                    color: "#FFFFFF",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Monthly Activity */}
        <Card className="bg-gray-800/50 border-purple-500/20 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Monthly Activity</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={usageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #8B5CF6",
                  borderRadius: "8px",
                  color: "#FFFFFF",
                }}
              />
              <Bar dataKey="users" fill="#8B5CF6" />
              <Bar dataKey="credentials" fill="#06B6D4" />
              <Bar dataKey="verifications" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </AdminLayout>
  )
}
