"use client"

import { AdminLayout } from "@/components/admin/admin-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    platformName: "BlockCreds",
    supportEmail: "support@blockcreds.com",
    maxFileSize: "10",
    allowedFileTypes: "pdf,jpg,png,doc,docx",
    autoVerification: true,
    emailNotifications: true,
    maintenanceMode: false,
    registrationEnabled: true,
    blockchainNetwork: "ethereum",
    gasLimit: "100000",
    smtpServer: "smtp.gmail.com",
    smtpPort: "587",
    smtpUsername: "",
    smtpPassword: "",
  })

  const { toast } = useToast()

  const handleSave = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        toast({
          title: "Settings saved",
          description: "Platform settings have been updated successfully.",
        })
      } else {
        throw new Error("Failed to save settings")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Platform Settings</h1>
          <p className="text-gray-400">Configure platform-wide settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* General Settings */}
          <Card className="bg-gray-800/50 border-purple-500/20 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">General Settings</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="platformName" className="text-gray-300">
                  Platform Name
                </Label>
                <Input
                  id="platformName"
                  value={settings.platformName}
                  onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                  className="bg-gray-700/50 border-purple-500/20 text-white"
                />
              </div>
              <div>
                <Label htmlFor="supportEmail" className="text-gray-300">
                  Support Email
                </Label>
                <Input
                  id="supportEmail"
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                  className="bg-gray-700/50 border-purple-500/20 text-white"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="registrationEnabled" className="text-gray-300">
                  Enable User Registration
                </Label>
                <Switch
                  id="registrationEnabled"
                  checked={settings.registrationEnabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, registrationEnabled: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="maintenanceMode" className="text-gray-300">
                  Maintenance Mode
                </Label>
                <Switch
                  id="maintenanceMode"
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
                />
              </div>
            </div>
          </Card>

          {/* File Upload Settings */}
          <Card className="bg-gray-800/50 border-purple-500/20 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">File Upload Settings</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="maxFileSize" className="text-gray-300">
                  Max File Size (MB)
                </Label>
                <Input
                  id="maxFileSize"
                  type="number"
                  value={settings.maxFileSize}
                  onChange={(e) => setSettings({ ...settings, maxFileSize: e.target.value })}
                  className="bg-gray-700/50 border-purple-500/20 text-white"
                />
              </div>
              <div>
                <Label htmlFor="allowedFileTypes" className="text-gray-300">
                  Allowed File Types
                </Label>
                <Input
                  id="allowedFileTypes"
                  value={settings.allowedFileTypes}
                  onChange={(e) => setSettings({ ...settings, allowedFileTypes: e.target.value })}
                  placeholder="pdf,jpg,png,doc,docx"
                  className="bg-gray-700/50 border-purple-500/20 text-white"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="autoVerification" className="text-gray-300">
                  Auto Verification
                </Label>
                <Switch
                  id="autoVerification"
                  checked={settings.autoVerification}
                  onCheckedChange={(checked) => setSettings({ ...settings, autoVerification: checked })}
                />
              </div>
            </div>
          </Card>

          {/* Blockchain Settings */}
          <Card className="bg-gray-800/50 border-purple-500/20 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Blockchain Settings</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="blockchainNetwork" className="text-gray-300">
                  Blockchain Network
                </Label>
                <Select
                  value={settings.blockchainNetwork}
                  onValueChange={(value) => setSettings({ ...settings, blockchainNetwork: value })}
                >
                  <SelectTrigger className="bg-gray-700/50 border-purple-500/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ethereum">Ethereum</SelectItem>
                    <SelectItem value="polygon">Polygon</SelectItem>
                    <SelectItem value="bsc">Binance Smart Chain</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="gasLimit" className="text-gray-300">
                  Gas Limit
                </Label>
                <Input
                  id="gasLimit"
                  value={settings.gasLimit}
                  onChange={(e) => setSettings({ ...settings, gasLimit: e.target.value })}
                  className="bg-gray-700/50 border-purple-500/20 text-white"
                />
              </div>
            </div>
          </Card>

          {/* Email Settings */}
          <Card className="bg-gray-800/50 border-purple-500/20 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Email Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="emailNotifications" className="text-gray-300">
                  Email Notifications
                </Label>
                <Switch
                  id="emailNotifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                />
              </div>
              <div>
                <Label htmlFor="smtpServer" className="text-gray-300">
                  SMTP Server
                </Label>
                <Input
                  id="smtpServer"
                  value={settings.smtpServer}
                  onChange={(e) => setSettings({ ...settings, smtpServer: e.target.value })}
                  className="bg-gray-700/50 border-purple-500/20 text-white"
                />
              </div>
              <div>
                <Label htmlFor="smtpPort" className="text-gray-300">
                  SMTP Port
                </Label>
                <Input
                  id="smtpPort"
                  value={settings.smtpPort}
                  onChange={(e) => setSettings({ ...settings, smtpPort: e.target.value })}
                  className="bg-gray-700/50 border-purple-500/20 text-white"
                />
              </div>
              <div>
                <Label htmlFor="smtpUsername" className="text-gray-300">
                  SMTP Username
                </Label>
                <Input
                  id="smtpUsername"
                  value={settings.smtpUsername}
                  onChange={(e) => setSettings({ ...settings, smtpUsername: e.target.value })}
                  className="bg-gray-700/50 border-purple-500/20 text-white"
                />
              </div>
              <div>
                <Label htmlFor="smtpPassword" className="text-gray-300">
                  SMTP Password
                </Label>
                <Input
                  id="smtpPassword"
                  type="password"
                  value={settings.smtpPassword}
                  onChange={(e) => setSettings({ ...settings, smtpPassword: e.target.value })}
                  className="bg-gray-700/50 border-purple-500/20 text-white"
                />
              </div>
            </div>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">
            Save Settings
          </Button>
        </div>
      </div>
    </AdminLayout>
  )
}
