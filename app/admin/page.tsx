import { AdminLayout } from "@/components/admin/admin-layout"
import { AdminOverview } from "@/components/admin/admin-overview"
import { SystemStats } from "@/components/admin/system-stats"
import { RecentActivity } from "@/components/admin/recent-activity"
import { QuickActions } from "@/components/admin/quick-actions"

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Monitor and manage your BlockCreds platform</p>
        </div>

        <SystemStats />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <AdminOverview />
          </div>
          <div className="space-y-6">
            <QuickActions />
            <RecentActivity />
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
