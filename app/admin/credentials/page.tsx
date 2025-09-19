import { AdminLayout } from "@/components/admin/admin-layout"
import { CredentialManagement } from "@/components/admin/credential-management"

export default function AdminCredentials() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Credential Management</h1>
          <p className="text-gray-400">Monitor and manage all credentials in the system</p>
        </div>

        <CredentialManagement />
      </div>
    </AdminLayout>
  )
}
