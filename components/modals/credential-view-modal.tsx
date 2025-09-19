"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, Share, Calendar, Building, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

interface Credential {
  _id: string
  title: string
  issuer_name: string
  issue_date: string
  is_verified: boolean
  credential_data: {
    type: string
    description: string
    organization?: string
  }
}

interface CredentialViewModalProps {
  credential: Credential | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onExport: (credential: Credential) => void
  onShare: (credential: Credential) => void
}

export function CredentialViewModal({ credential, open, onOpenChange, onExport, onShare }: CredentialViewModalProps) {
  if (!credential) return null

  const getTypeColor = (type: string) => {
    const colors = {
      Education: "bg-blue-500/20 text-blue-300",
      Professional: "bg-purple-500/20 text-purple-300",
      License: "bg-green-500/20 text-green-300",
      Certificate: "bg-yellow-500/20 text-yellow-300",
      default: "bg-gray-500/20 text-gray-300",
    }
    return colors[type as keyof typeof colors] || colors.default
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-gray-900 border-purple-500/20">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">{credential.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Credential Image Placeholder */}
          <div className="w-full h-64 bg-gray-800 rounded-lg flex items-center justify-center border border-purple-500/20">
            <FileText className="w-16 h-16 text-purple-400" />
          </div>

          {/* Credential Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">Issuer</span>
              </div>
              <p className="text-white font-medium">{credential.issuer_name}</p>
              {credential.credential_data?.organization && (
                <p className="text-sm text-gray-400">{credential.credential_data.organization}</p>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">Issue Date</span>
              </div>
              <p className="text-white">{new Date(credential.issue_date).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Description */}
          {credential.credential_data?.description && (
            <div className="space-y-2">
              <h4 className="text-white font-medium">Description</h4>
              <p className="text-gray-300 text-sm">{credential.credential_data.description}</p>
            </div>
          )}

          {/* Badges */}
          <div className="flex items-center gap-2">
            <Badge className={cn("text-xs", getTypeColor(credential.credential_data?.type || "default"))}>
              {credential.credential_data?.type || "Document"}
            </Badge>
            <Badge
              className={cn(
                "text-xs",
                credential.is_verified ? "bg-green-500/20 text-green-300" : "bg-yellow-500/20 text-yellow-300",
              )}
            >
              {credential.is_verified ? "Verified" : "Pending"}
            </Badge>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-700">
            <Button onClick={() => onExport(credential)} className="flex-1" variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            <Button onClick={() => onShare(credential)} className="flex-1" variant="outline">
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
