"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MagnifyingGlassIcon, EyeIcon, TrashIcon, DocumentCheckIcon } from "@heroicons/react/24/outline"

const credentials = [
  {
    id: 1,
    title: "University Diploma",
    owner: "John Doe",
    type: "Education",
    status: "Verified",
    uploadDate: "2024-01-15",
    verifications: 23,
    hashcode: "bc1a2f3d...",
  },
  {
    id: 2,
    title: "Professional Certificate",
    owner: "Jane Smith",
    type: "Professional",
    status: "Pending",
    uploadDate: "2024-01-14",
    verifications: 5,
    hashcode: "ef4b5c6d...",
  },
  {
    id: 3,
    title: "Medical License",
    owner: "Dr. Wilson",
    type: "License",
    status: "Verified",
    uploadDate: "2024-01-13",
    verifications: 45,
    hashcode: "gh7i8j9k...",
  },
]

export function CredentialManagement() {
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search credentials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800/50 border-purple-500/20 text-white placeholder-gray-400"
            />
          </div>
        </div>
      </div>

      <Card className="bg-gray-800/50 border-purple-500/20">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-purple-500/20">
                <th className="text-left p-4 text-sm font-medium text-gray-300">Credential</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Owner</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Type</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Status</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Verifications</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Upload Date</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {credentials.map((credential) => (
                <tr key={credential.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <DocumentCheckIcon className="h-5 w-5 text-purple-400" />
                      <div>
                        <p className="text-sm font-medium text-white">{credential.title}</p>
                        <p className="text-xs text-gray-400">{credential.hashcode}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-300">{credential.owner}</td>
                  <td className="p-4">
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-500/20 text-blue-300">
                      {credential.type}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        credential.status === "Verified"
                          ? "bg-green-500/20 text-green-300"
                          : "bg-yellow-500/20 text-yellow-300"
                      }`}
                    >
                      {credential.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-300">{credential.verifications}</td>
                  <td className="p-4 text-sm text-gray-400">{credential.uploadDate}</td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
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
