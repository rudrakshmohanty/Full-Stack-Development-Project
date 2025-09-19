"use client"

import { Button } from "@/components/ui/button"
import { Share2, Download } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useState } from "react"

interface CredentialActionsProps {
  credentialId: string
  credentialData?: any
}

export function CredentialActions({ credentialId, credentialData }: CredentialActionsProps) {
  const { toast } = useToast()
  const [isExporting, setIsExporting] = useState(false)
  const [isSharing, setIsSharing] = useState(false)

  const handleShare = async () => {
    if (typeof window === "undefined") return
    
    setIsSharing(true)
    try {
      const shareUrl = `${window.location.origin}/verification/${credentialId}`
      
      if (navigator.share) {
        await navigator.share({
          title: "Verify my credential",
          text: "Check out my blockchain-verified credential",
          url: shareUrl,
        })
      } else {
        await navigator.clipboard.writeText(shareUrl)
        toast({
          title: "Link copied!",
          description: "Credential verification link has been copied to your clipboard",
        })
      }
    } catch (err) {
      console.error('Error sharing:', err)
      toast({
        title: "Sharing failed",
        description: "There was an error sharing the credential. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSharing(false)
    }
  }

  const handleExport = async () => {
    if (typeof window === "undefined") return
    
    setIsExporting(true)
    try {
      const response = await fetch(`/api/credentials/${credentialId}/export`, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf'
        }
      })
      
      if (!response.ok) throw new Error('Export failed')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `credential-${credentialId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Export successful",
        description: "Your credential has been exported as PDF",
      })
    } catch (err) {
      console.error('Error exporting:', err)
      toast({
        title: "Export failed",
        description: "There was an error exporting the credential. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleShare}
        disabled={isSharing}
      >
        <Share2 className="h-4 w-4 mr-2" />
        Share
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleExport}
        disabled={isExporting}
      >
        <Download className="h-4 w-4 mr-2" />
        Export PDF
      </Button>
    </div>
  )
}
