import { CredentialUploadForm } from "@/components/dashboard/credential-upload-form"

export default function UploadPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-playfair font-bold">Upload Credential</h1>
        <p className="text-muted-foreground mt-2">Securely upload and verify your credential on the blockchain</p>
      </div>

      <CredentialUploadForm />
    </div>
  )
}
