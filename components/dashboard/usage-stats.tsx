"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Upload, Shield, HardDrive } from "lucide-react"

export function UsageStats() {
  const usageData = {
    credentialsUsed: 3,
    verificationsThisMonth: 12,
    storageUsed: 45, // percentage
  }

  return (
    <Card className="bg-gray-800/50 border-purple-500/20">
      <CardHeader>
        <CardTitle className="text-white">Usage Statistics</CardTitle>
        <CardDescription className="text-gray-400">Track your activity on BlockCreds</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-300 flex items-center">
              <Upload className="w-4 h-4 mr-2" />
              Credential Uploads
            </span>
            <span className="text-white">{usageData.credentialsUsed}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-300 flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              Verifications This Month
            </span>
            <span className="text-white">{usageData.verificationsThisMonth}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-300 flex items-center">
              <HardDrive className="w-4 h-4 mr-2" />
              Storage Used
            </span>
            <span className="text-white">{usageData.storageUsed}%</span>
          </div>
          <Progress value={usageData.storageUsed} className="h-2" />
        </div>
      </CardContent>
    </Card>
  )
}
