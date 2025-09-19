import { ProfileForm } from "@/components/dashboard/profile-form"
import { SecuritySettings } from "@/components/dashboard/security-settings"
import { UsageStats } from "@/components/dashboard/usage-stats"

export default function ProfilePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-playfair font-bold">Profile Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your account information and security settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <ProfileForm />
          <SecuritySettings />
        </div>
        <div>
          <UsageStats />
        </div>
      </div>
    </div>
  )
}
