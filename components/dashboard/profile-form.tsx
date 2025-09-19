"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Camera, Save, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export function ProfileForm() {
  const { user, token, updateUser } = useAuth()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    organization: "",
  })

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        organization: user.organization || "",
      })
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      if (!token) {
        throw new Error("Authentication token not found")
      }

      const response = await fetch("http://localhost:5001/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile")
      }

      updateUser(formData)
      setSuccess("Profile updated successfully!")
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const getRoleBadgeColor = (role: string) => {
    const colors = {
      admin: "bg-red-500/20 text-red-300",
      issuer: "bg-purple-500/20 text-purple-300",
      recipient: "bg-blue-500/20 text-blue-300",
      premium: "bg-yellow-500/20 text-yellow-300",
    }
    return colors[role as keyof typeof colors] || "bg-gray-500/20 text-gray-300"
  }

  const getInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`
    }
    if (user?.username) {
      return user.username.slice(0, 2).toUpperCase()
    }
    return "U"
  }

  if (!user) {
    return (
      <Card className="bg-gray-800/50 border-purple-500/20">
        <CardContent className="pt-6">
          <div className="text-center text-gray-400">Loading profile...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-800/50 border-purple-500/20">
      <CardHeader>
        <CardTitle className="text-white">Profile Information</CardTitle>
        <CardDescription className="text-gray-400">Update your personal information and preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Avatar Section */}
        <div className="flex items-center space-x-6">
          <div className="relative">
            <Avatar className="w-20 h-20">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xl">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <Button
              variant="outline"
              size="sm"
              className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full p-0 bg-transparent"
            >
              <Camera className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-white">
                {user.first_name || user.username} {user.last_name}
              </h3>
              <Badge className={getRoleBadgeColor(user.role)}>{user.role}</Badge>
            </div>
            <p className="text-gray-400 text-sm">{user.email}</p>
            <p className="text-gray-500 text-xs">Member since {new Date(user.created_at).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="p-3 rounded bg-red-500/20 border border-red-500/30 text-red-300 text-sm">{error}</div>
        )}

        {success && (
          <div className="p-3 rounded bg-green-500/20 border border-green-500/30 text-green-300 text-sm">{success}</div>
        )}

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name" className="text-gray-300">
                First Name
              </Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => handleInputChange("first_name", e.target.value)}
                className="bg-gray-700/50 border-purple-500/20 text-white"
                placeholder="Enter first name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name" className="text-gray-300">
                Last Name
              </Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => handleInputChange("last_name", e.target.value)}
                className="bg-gray-700/50 border-purple-500/20 text-white"
                placeholder="Enter last name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username" className="text-gray-300">
              Username
            </Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => handleInputChange("username", e.target.value)}
              className="bg-gray-700/50 border-purple-500/20 text-white"
              placeholder="Enter username"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-300">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={user.email}
              disabled
              className="bg-gray-700/30 border-gray-600 text-gray-400 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500">Email cannot be changed</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="organization" className="text-gray-300">
              Organization
            </Label>
            <Input
              id="organization"
              value={formData.organization}
              onChange={(e) => handleInputChange("organization", e.target.value)}
              className="bg-gray-700/50 border-purple-500/20 text-white"
              placeholder="Enter organization name"
            />
          </div>

          <Button type="submit" disabled={saving} className="bg-purple-600 hover:bg-purple-700 text-white">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
