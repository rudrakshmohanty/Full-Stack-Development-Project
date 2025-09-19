"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MagnifyingGlassIcon, EllipsisVerticalIcon, UserPlusIcon } from "@heroicons/react/24/outline"

const users = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    role: "User",
    status: "Active",
    credentials: 12,
    lastActive: "2 hours ago",
    avatar: "JD",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    role: "Premium",
    status: "Active",
    credentials: 28,
    lastActive: "1 day ago",
    avatar: "JS",
  },
  {
    id: 3,
    name: "Bob Johnson",
    email: "bob@example.com",
    role: "User",
    status: "Suspended",
    credentials: 5,
    lastActive: "1 week ago",
    avatar: "BJ",
  },
]

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800/50 border-purple-500/20 text-white placeholder-gray-400"
            />
          </div>
        </div>

        <Button className="bg-purple-600 hover:bg-purple-700">
          <UserPlusIcon className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <Card className="bg-gray-800/50 border-purple-500/20">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-purple-500/20">
                <th className="text-left p-4 text-sm font-medium text-gray-300">User</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Role</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Status</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Credentials</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Last Active</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-white">{user.avatar}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        user.role === "Premium" ? "bg-purple-500/20 text-purple-300" : "bg-gray-500/20 text-gray-300"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        user.status === "Active" ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-300">{user.credentials}</td>
                  <td className="p-4 text-sm text-gray-400">{user.lastActive}</td>
                  <td className="p-4">
                    <Button variant="ghost" size="sm">
                      <EllipsisVerticalIcon className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
