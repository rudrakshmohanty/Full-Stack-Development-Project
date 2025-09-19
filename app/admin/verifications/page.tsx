import { AdminLayout } from "@/components/admin/admin-layout"
import { VerificationMonitoring } from "@/components/admin/verification-monitoring"

export default function AdminVerifications() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Verification Monitoring</h1>
          <p className="text-gray-400">Track verification requests and results</p>
        </div>

        <VerificationMonitoring />
      </div>
    </AdminLayout>
  )
}
