"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Crown, Users, Upload, Shield, Star, CheckCircle, X } from "lucide-react"

interface SubscriptionTier {
  name: string
  price: string
  features: string[]
  current: boolean
  popular?: boolean
}

const subscriptionTiers: SubscriptionTier[] = [
  {
    name: "Free",
    price: "$0/month",
    features: ["5 credential uploads", "Basic verification", "Email support"],
    current: true
  },
  {
    name: "Pro",
    price: "$9.99/month",
    features: ["50 credential uploads", "Advanced verification", "Priority support", "API access"],
    current: false,
    popular: true
  },
  {
    name: "Enterprise",
    price: "$29.99/month",
    features: ["Unlimited uploads", "White-label solution", "24/7 support", "Custom integration", "Advanced analytics"],
    current: false
  }
]

export function SubscriptionInfo() {
  const [currentPlan] = useState("Free")
  const [usageData] = useState({
    credentialsUsed: 3,
    credentialsLimit: 5,
    verificationsThisMonth: 12,
    storageUsed: 45 // percentage
  })

  const getCurrentTier = () => {
    return subscriptionTiers.find(tier => tier.current) || subscriptionTiers[0]
  }

  const currentTier = getCurrentTier()

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/30">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Crown className="w-5 h-5 text-yellow-400" />
            <CardTitle className="text-white">Current Plan</CardTitle>
          </div>
          <CardDescription className="text-gray-400">
            Your current subscription details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">{currentTier.name}</h3>
              <p className="text-gray-400">{currentTier.price}</p>
            </div>
            <Badge className="bg-purple-500/20 text-purple-300">
              Active
            </Badge>
          </div>

          {currentPlan === "Free" && (
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-start space-x-2">
                <Star className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-blue-300 text-sm font-medium">Upgrade Available</p>
                  <p className="text-blue-400/80 text-xs mt-1">
                    Get more features and higher limits with a Pro subscription.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      <Card className="bg-gray-800/50 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white">Usage This Month</CardTitle>
          <CardDescription className="text-gray-400">
            Track your current usage against plan limits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-300 flex items-center">
                <Upload className="w-4 h-4 mr-2" />
                Credential Uploads
              </span>
              <span className="text-white">
                {usageData.credentialsUsed} / {usageData.credentialsLimit}
              </span>
            </div>
            <Progress 
              value={(usageData.credentialsUsed / usageData.credentialsLimit) * 100} 
              className="h-2"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-300 flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                Verifications
              </span>
              <span className="text-white">{usageData.verificationsThisMonth}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-300">Storage Used</span>
              <span className="text-white">{usageData.storageUsed}%</span>
            </div>
            <Progress value={usageData.storageUsed} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <Card className="bg-gray-800/50 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white">Available Plans</CardTitle>
          <CardDescription className="text-gray-400">
            Choose the plan that best fits your needs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {subscriptionTiers.map((tier, index) => (
            <div
              key={tier.name}
              className={`p-4 rounded-lg border transition-all ${
                tier.current
                  ? 'bg-purple-500/10 border-purple-500/30'
                  : 'bg-gray-700/30 border-gray-600/30 hover:border-purple-500/20'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <h4 className="font-semibold text-white">{tier.name}</h4>
                  {tier.popular && (
                    <Badge className="bg-yellow-500/20 text-yellow-300 text-xs">
                      Popular
                    </Badge>
                  )}
                  {tier.current && (
                    <Badge className="bg-green-500/20 text-green-300 text-xs">
                      Current
                    </Badge>
                  )}
                </div>
                <span className="font-bold text-white">{tier.price}</span>
              </div>

              <div className="space-y-2 mb-4">
                {tier.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>

              {!tier.current && (
                <Button
                  variant={tier.popular ? "default" : "outline"}
                  size="sm"
                  className={
                    tier.popular
                      ? "bg-purple-600 hover:bg-purple-700 text-white w-full"
                      : "w-full"
                  }
                >
                  {tier.name === "Free" ? "Downgrade" : "Upgrade"}
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Billing Information */}
      {currentPlan !== "Free" && (
        <Card className="bg-gray-800/50 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white">Billing Information</CardTitle>
            <CardDescription className="text-gray-400">
              Manage your billing and payment details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
              <div>
                <p className="text-white font-medium">Next billing date</p>
                <p className="text-gray-400 text-sm">February 15, 2024</p>
              </div>
              <p className="text-white font-semibold">$9.99</p>
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="flex-1">
                Update Payment
              </Button>
              <Button variant="outline" size="sm" className="flex-1 text-red-400 hover:text-red-300">
                Cancel Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
