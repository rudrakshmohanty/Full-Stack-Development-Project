import { DashboardOverview } from "@/components/dashboard/dashboard-overview"
import { RecentCredentials } from "@/components/dashboard/recent-credentials"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { VerificationStats } from "@/components/dashboard/verification-stats"

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-playfair font-bold text-balance">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Manage your credentials and track verification activity</p>
      </div>

      <DashboardOverview />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <RecentCredentials />
        </div>
        <div className="space-y-8">
          <QuickActions />
          <VerificationStats />
        </div>
      </div>
    </div>
  )
}
