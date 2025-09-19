import { CredentialGallery } from "@/components/dashboard/credential-gallery"
import { CredentialFilters } from "@/components/dashboard/credential-filters"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function CredentialsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-playfair font-bold">My Credentials</h1>
          <p className="text-muted-foreground mt-2">View and manage all your verified credentials</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/upload">
            <Plus className="size-4 mr-2" />
            Upload Credential
          </Link>
        </Button>
      </div>

      <CredentialFilters />
      <CredentialGallery />
    </div>
  )
}
