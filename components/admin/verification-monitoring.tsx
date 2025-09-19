"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircleIcon, XCircleIcon, ClockIcon, EyeIcon } from "@heroicons/react/24/outline"

const verifications = [
  {
    id: 1,
    credentialTitle: "University Diploma",
    requester: "ABC Company",
    status: "Success",
    confidence: 98.5,
    timestamp: "2024-01-15 14:30:22",
    processingTime: "2.3s",
  },
  {
    id: 2,
    credentialTitle: "Professional Certificate",
    requester: "XYZ Corp",
    status: "Failed",
    confidence: 23.1,
    timestamp: "2024-01-15 14:28:15",
    processingTime: "1.8s",
  },
  {
    id: 3,
    credentialTitle: "Medical License",
    requester: "Healthcare Inc",
    status: "Processing",
    confidence: null,
    timestamp: "2024-01-15 14:29:45",
    processingTime: null,
  },
]

export function VerificationMonitoring() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gray-800/50 border-purple-500/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Success Rate</p>
              <p className="text-2xl font-bold text-green-400">94.2%</p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-400" />
          </div>
        </Card>

        <Card className="bg-gray-800/50 border-purple-500/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Avg Processing Time</p>
              <p className="text-2xl font-bold text-blue-400">2.1s</p>
            </div>
            <ClockIcon className="h-8 w-8 text-blue-400" />
          </div>
        </Card>

        <Card className="bg-gray-800/50 border-purple-500/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Failed Verifications</p>
              <p className="text-2xl font-bold text-red-400">5.8%</p>
            </div>
            <XCircleIcon className="h-8 w-8 text-red-400" />
          </div>
        </Card>
      </div>

      <Card className="bg-gray-800/50 border-purple-500/20">
        <div className="p-6 border-b border-purple-500/20">
          <h3 className="text-lg font-semibold text-white">Recent Verifications</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-purple-500/20">
                <th className="text-left p-4 text-sm font-medium text-gray-300">Credential</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Requester</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Status</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Confidence</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Processing Time</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Timestamp</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {verifications.map((verification) => (
                <tr key={verification.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                  <td className="p-4 text-sm text-white">{verification.credentialTitle}</td>
                  <td className="p-4 text-sm text-gray-300">{verification.requester}</td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                        verification.status === "Success"
                          ? "bg-green-500/20 text-green-300"
                          : verification.status === "Failed"
                            ? "bg-red-500/20 text-red-300"
                            : "bg-yellow-500/20 text-yellow-300"
                      }`}
                    >
                      {verification.status === "Success" && <CheckCircleIcon className="h-3 w-3 mr-1" />}
                      {verification.status === "Failed" && <XCircleIcon className="h-3 w-3 mr-1" />}
                      {verification.status === "Processing" && <ClockIcon className="h-3 w-3 mr-1" />}
                      {verification.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-300">
                    {verification.confidence ? `${verification.confidence}%` : "-"}
                  </td>
                  <td className="p-4 text-sm text-gray-300">{verification.processingTime || "-"}</td>
                  <td className="p-4 text-sm text-gray-400">{verification.timestamp}</td>
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
    </div>
  )
}
