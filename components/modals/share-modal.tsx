"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy, Mail, Link, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Credential {
  _id: string
  title: string
  issuer_name: string
}

interface ShareModalProps {
  credential: Credential | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ShareModal({ credential, open, onOpenChange }: ShareModalProps) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  if (!credential) return null

  const shareUrl = `${window.location.origin}/verify/${credential._id}`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast({
        title: "Link copied!",
        description: "Verification link has been copied to clipboard.",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually.",
        variant: "destructive",
      })
    }
  }

  const shareViaEmail = () => {
    const subject = `Verify my credential: ${credential.title}`
    const body = `Please verify my credential "${credential.title}" issued by ${credential.issuer_name}.\n\nVerification link: ${shareUrl}`
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-gray-900 border-purple-500/20">
        <DialogHeader>
          <DialogTitle className="text-white">Share Credential</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-gray-800 rounded-lg border border-purple-500/20">
            <h4 className="text-white font-medium mb-1">{credential.title}</h4>
            <p className="text-gray-400 text-sm">by {credential.issuer_name}</p>
          </div>

          <div className="space-y-2">
            <Label className="text-white">Verification Link</Label>
            <div className="flex gap-2">
              <Input value={shareUrl} readOnly className="bg-gray-800 border-gray-700 text-white" />
              <Button onClick={copyToClipboard} variant="outline" size="icon" className="shrink-0 bg-transparent">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={copyToClipboard} variant="outline" className="flex-1 bg-transparent">
              <Link className="w-4 h-4 mr-2" />
              Copy Link
            </Button>
            <Button onClick={shareViaEmail} variant="outline" className="flex-1 bg-transparent">
              <Mail className="w-4 h-4 mr-2" />
              Email
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
