"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { SecuritySettings } from "./security-settings"

export function SettingsPage() {
  const { user, updateUser } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: false,
    securityAlerts: true,
    weeklyReports: true,
  })

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.target as HTMLFormElement)
    const profileData = {
      first_name: formData.get("firstName") as string,
      last_name: formData.get("lastName") as string,
      organization: formData.get("organization") as string,
    }

    try {
      const response = await fetch("http://localhost:5001/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(profileData),
      })

      if (response.ok) {
        const result = await response.json()
        updateUser(result.profile)
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully.",
        })
      } else {
        throw new Error("Failed to update profile")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleNotificationUpdate = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/notifications/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        toast({
          title: "Notifications updated",
          description: "Your notification preferences have been saved.",
        })
      } else {
        throw new Error("Failed to update notifications")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update notification settings.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Account Settings</h1>
        <p className="text-gray-400">Manage your account information and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Information */}
        <Card className="bg-gray-800/50 border-purple-500/20 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Profile Information</h3>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="text-gray-300">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  defaultValue={user?.first_name}
                  className="bg-gray-700/50 border-purple-500/20 text-white"
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-gray-300">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  defaultValue={user?.last_name}
                  className="bg-gray-700/50 border-purple-500/20 text-white"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email" className="text-gray-300">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={user?.email}
                disabled
                className="bg-gray-700/30 border-purple-500/20 text-gray-400"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>
            <div>
              <Label htmlFor="organization" className="text-gray-300">
                Organization
              </Label>
              <Input
                id="organization"
                name="organization"
                defaultValue={user?.organization}
                className="bg-gray-700/50 border-purple-500/20 text-white"
              />
            </div>
            <Button type="submit" disabled={isLoading} className="bg-purple-600 hover:bg-purple-700">
              {isLoading ? "Updating..." : "Update Profile"}
            </Button>
          </form>
        </Card>

        {/* Notification Settings */}
        <Card className="bg-gray-800/50 border-purple-500/20 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Notification Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gray-300">Email Notifications</Label>
                <p className="text-sm text-gray-500">Receive email updates about your credentials</p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gray-300">Security Alerts</Label>
                <p className="text-sm text-gray-500">Get notified about security events</p>
              </div>
              <Switch
                checked={settings.securityAlerts}
                onCheckedChange={(checked) => setSettings({ ...settings, securityAlerts: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gray-300">Weekly Reports</Label>
                <p className="text-sm text-gray-500">Receive weekly activity summaries</p>
              </div>
              <Switch
                checked={settings.weeklyReports}
                onCheckedChange={(checked) => setSettings({ ...settings, weeklyReports: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gray-300">Marketing Emails</Label>
                <p className="text-sm text-gray-500">Receive product updates and news</p>
              </div>
              <Switch
                checked={settings.marketingEmails}
                onCheckedChange={(checked) => setSettings({ ...settings, marketingEmails: checked })}
              />
            </div>
            <Button onClick={handleNotificationUpdate} className="bg-purple-600 hover:bg-purple-700">
              Save Preferences
            </Button>
          </div>
        </Card>
      </div>

      {/* Security Settings */}
      <SecuritySettings />
    </div>
  )
}
