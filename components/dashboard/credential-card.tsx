"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { CredentialActions } from "@/components/dashboard/credential-actions"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, CheckCircle2 } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface CredentialCardProps {
  credential: {
    _id: string
    title: string
    issuer_name: string
    issue_date: string
    is_verified: boolean
    credential_type?: string
  }
}

export function CredentialCard({ credential }: CredentialCardProps) {
  return (
    <Card id={`credential-${credential._id}`} className="relative">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl font-semibold">{credential.title}</CardTitle>
            <CardDescription className="mt-1.5">
              Issued by {credential.issuer_name}
            </CardDescription>
          </div>
          {credential.is_verified && (
            <Badge variant="secondary" className="flex items-center gap-1 bg-green-100 text-green-700 hover:bg-green-200">
              <CheckCircle2 className="h-3 w-3" />
              Verified
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center text-sm text-muted-foreground">
          <CalendarIcon className="mr-1 h-4 w-4" />
          Issued on {formatDate(credential.issue_date)}
        </div>
        {credential.credential_type && (
          <Badge variant="secondary" className="mt-2">
            {credential.credential_type}
          </Badge>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <CredentialActions credentialId={credential._id} credentialData={credential} />
      </CardFooter>
    </Card>
  )
}
