import { AdminLayout } from "@/components/admin/admin-layout"
import { BlockchainMonitoring } from "@/components/admin/blockchain-monitoring"

export default function AdminBlockchain() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Blockchain Monitoring</h1>
          <p className="text-gray-400">Monitor blockchain transactions and smart contracts</p>
        </div>

        <BlockchainMonitoring />
      </div>
    </AdminLayout>
  )
}
