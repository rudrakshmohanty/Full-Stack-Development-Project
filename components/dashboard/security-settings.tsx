"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Shield, Key, Smartphone, Eye, EyeOff, AlertTriangle, CheckCircle } from "lucide-react"

export function SecuritySettings() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  })
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [loading, setLoading] = useState(false)

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      setPasswords({ current: "", new: "", confirm: "" })
      // Show success message
    }, 1500)
  }

  const toggleTwoFactor = () => {
    setTwoFactorEnabled(!twoFactorEnabled)
  }

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <Card className="bg-gray-800/50 border-purple-500/20">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Key className="w-5 h-5 text-purple-400" />
            <CardTitle className="text-white">Change Password</CardTitle>
          </div>
          <CardDescription className="text-gray-400">
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password" className="text-gray-300">Current Password</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwords.current}
                  onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
                  className="bg-gray-700/50 border-purple-500/20 text-white pr-10"
                  placeholder="Enter current password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-gray-300">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  value={passwords.new}
                  onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                  className="bg-gray-700/50 border-purple-500/20 text-white pr-10"
                  placeholder="Enter new password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              <div className="text-xs text-gray-400">
                Password must be at least 8 characters long
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-gray-300">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwords.confirm}
                  onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                  className="bg-gray-700/50 border-purple-500/20 text-white pr-10"
                  placeholder="Confirm new password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || !passwords.current || !passwords.new || !passwords.confirm}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card className="bg-gray-800/50 border-purple-500/20">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Smartphone className="w-5 h-5 text-purple-400" />
            <CardTitle className="text-white">Two-Factor Authentication</CardTitle>
          </div>
          <CardDescription className="text-gray-400">
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                twoFactorEnabled ? 'bg-green-500/20' : 'bg-gray-500/20'
              }`}>
                {twoFactorEnabled ? 
                  <CheckCircle className="w-5 h-5 text-green-400" /> :
                  <Shield className="w-5 h-5 text-gray-400" />
                }
              </div>
              <div>
                <p className="text-white font-medium">
                  Two-Factor Authentication
                </p>
                <p className="text-sm text-gray-400">
                  {twoFactorEnabled ? 'Currently enabled' : 'Currently disabled'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={twoFactorEnabled ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}>
                {twoFactorEnabled ? 'Enabled' : 'Disabled'}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTwoFactor}
                className={twoFactorEnabled ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'}
              >
                {twoFactorEnabled ? 'Disable' : 'Enable'}
              </Button>
            </div>
          </div>

          {!twoFactorEnabled && (
            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-yellow-300 text-sm font-medium">Security Recommendation</p>
                  <p className="text-yellow-400/80 text-xs mt-1">
                    Enable two-factor authentication to significantly improve your account security.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Activity */}
      <Card className="bg-gray-800/50 border-purple-500/20">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-purple-400" />
            <CardTitle className="text-white">Recent Security Activity</CardTitle>
          </div>
          <CardDescription className="text-gray-400">
            Monitor recent login attempts and security events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { action: "Successful login", location: "New York, US", time: "2 hours ago", status: "success" },
              { action: "Password changed", location: "New York, US", time: "1 day ago", status: "success" },
              { action: "Failed login attempt", location: "Unknown", time: "3 days ago", status: "warning" }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.status === 'success' ? 'bg-green-400' : 'bg-yellow-400'
                  }`}></div>
                  <div>
                    <p className="text-white text-sm">{activity.action}</p>
                    <p className="text-gray-400 text-xs">{activity.location}</p>
                  </div>
                </div>
                <p className="text-gray-400 text-xs">{activity.time}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
