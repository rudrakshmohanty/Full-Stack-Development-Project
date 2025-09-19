"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CubeIcon, ClockIcon, CurrencyDollarIcon, EyeIcon } from "@heroicons/react/24/outline"

const transactions = [
  {
    id: 1,
    hash: "0x1a2b3c4d5e6f...",
    type: "Store Credential",
    gasUsed: "21,000",
    gasPrice: "20 Gwei",
    status: "Confirmed",
    timestamp: "2024-01-15 14:30:22",
    blockNumber: 18945672,
  },
  {
    id: 2,
    hash: "0x2b3c4d5e6f7a...",
    type: "Verify Credential",
    gasUsed: "45,000",
    gasPrice: "22 Gwei",
    status: "Confirmed",
    timestamp: "2024-01-15 14:28:15",
    blockNumber: 18945671,
  },
  {
    id: 3,
    hash: "0x3c4d5e6f7a8b...",
    type: "Update Registry",
    gasUsed: "65,000",
    gasPrice: "25 Gwei",
    status: "Pending",
    timestamp: "2024-01-15 14:29:45",
    blockNumber: null,
  },
]

export function BlockchainMonitoring() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gray-800/50 border-purple-500/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Transactions</p>
              <p className="text-2xl font-bold text-purple-400">8,921</p>
            </div>
            <CubeIcon className="h-8 w-8 text-purple-400" />
          </div>
        </Card>

        <Card className="bg-gray-800/50 border-purple-500/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-yellow-400">12</p>
            </div>
            <ClockIcon className="h-8 w-8 text-yellow-400" />
          </div>
        </Card>

        <Card className="bg-gray-800/50 border-purple-500/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Gas Used Today</p>
              <p className="text-2xl font-bold text-blue-400">2.1M</p>
            </div>
            <CurrencyDollarIcon className="h-8 w-8 text-blue-400" />
          </div>
        </Card>

        <Card className="bg-gray-800/50 border-purple-500/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Network Status</p>
              <p className="text-2xl font-bold text-green-400">Healthy</p>
            </div>
            <div className="w-8 h-8 bg-green-400 rounded-full animate-pulse" />
          </div>
        </Card>
      </div>

      <Card className="bg-gray-800/50 border-purple-500/20">
        <div className="p-6 border-b border-purple-500/20">
          <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-purple-500/20">
                <th className="text-left p-4 text-sm font-medium text-gray-300">Transaction Hash</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Type</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Status</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Gas Used</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Block</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Timestamp</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                  <td className="p-4">
                    <code className="text-sm text-purple-300 bg-purple-500/10 px-2 py-1 rounded">{tx.hash}</code>
                  </td>
                  <td className="p-4 text-sm text-gray-300">{tx.type}</td>
                  <td className="p-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        tx.status === "Confirmed"
                          ? "bg-green-500/20 text-green-300"
                          : "bg-yellow-500/20 text-yellow-300"
                      }`}
                    >
                      {tx.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-300">{tx.gasUsed}</td>
                  <td className="p-4 text-sm text-gray-300">{tx.blockNumber ? `#${tx.blockNumber}` : "-"}</td>
                  <td className="p-4 text-sm text-gray-400">{tx.timestamp}</td>
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
