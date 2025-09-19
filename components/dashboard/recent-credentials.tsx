"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Share, MoreHorizontal, Terminal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CredentialViewModal } from "@/components/modals/credential-view-modal"
import { ShareModal } from "@/components/modals/share-modal"
import { useToast } from "@/hooks/use-toast"

import { Credential } from "@/types/credential"

export function RecentCredentials() {
  const [credentials, setCredentials] = useState<Credential[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCredential, setSelectedCredential] = useState<Credential | null>(null)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchCredentials = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          throw new Error("Authentication token not found. Please log in.")
        }

        const response = await fetch("http://localhost:5001/api/credentials", {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        })

        if (!response.ok) {
          const result = await response.json()
          throw new Error(result.error || "Failed to fetch credentials.")
        }

        const result = await response.json()
        setCredentials(result.credentials)
      } catch (err: any) {
        console.error("Error fetching credentials:", err);
        setError(err.message || "Failed to fetch credentials. Please check your connection and try again.");
        toast({
          title: "Error",
          description: "Failed to fetch credentials. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false)
      }
    }

    fetchCredentials()
  }, [])

  const handleView = (credential: Credential) => {
    setSelectedCredential(credential)
    setViewModalOpen(true)
  }

  const handleShare = (credential: Credential) => {
    setSelectedCredential(credential)
    setShareModalOpen(true)
  }

  const handleExport = async (credential: Credential) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:5001/api/credentials/${credential._id}/export`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to export credential")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${credential.title}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Export successful!",
        description: "Credential has been downloaded as PDF.",
      })
    } catch (err) {
      toast({
        title: "Export failed",
        description: "Failed to export credential. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (credential: Credential) => {
    if (!confirm("Are you sure you want to delete this credential?")) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:5001/api/credentials/${credential._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to delete credential")
      }

      setCredentials((prev) => prev.filter((c) => c._id !== credential._id))
      toast({
        title: "Credential deleted",
        description: "Credential has been successfully deleted.",
      })
    } catch (err) {
      toast({
        title: "Delete failed",
        description: "Failed to delete credential. Please try again.",
        variant: "destructive",
      })
    }
  }

  const renderContent = () => {
    if (isLoading) {
      return Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <Skeleton className="size-16 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Unable to Load Credentials</AlertTitle>
          <AlertDescription>
            <p className="mb-2">{error}</p>
            <Button 
              variant="outline" 
              className="mt-2"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      )
    }

    if (credentials.length === 0) {
      return <p className="text-center text-muted-foreground">No credentials found.</p>
    }

    return credentials.map((credential) => (
      <div
        key={credential._id}
        className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
      >
        <div className="size-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
          {/* Placeholder image, as API doesn't provide one yet */}
          <img src={"/placeholder.svg"} alt={credential.title} className="size-full object-cover" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate">{credential.title}</h3>
          <p className="text-sm text-muted-foreground">{credential.issuer_name}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge
              variant={credential.is_verified ? "default" : "secondary"}
              className={credential.is_verified ? "bg-green-500" : ""}
            >
              {credential.is_verified ? "Verified" : "Processing"}
            </Badge>
            <span className="text-xs text-muted-foreground">{credential.issue_date}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => handleView(credential)}>
            <Eye className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleShare(credential)}>
            <Share className="size-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleView(credential)}>View Details</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport(credential)}>Download</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShare(credential)}>Share</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(credential)}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    ))
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Credentials</CardTitle>
              <CardDescription>Your latest uploaded credentials</CardDescription>
            </div>
            <Button variant="outline" asChild>
              <Link href="/dashboard/credentials">View All</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">{renderContent()}</div>
        </CardContent>
      </Card>

      <CredentialViewModal
        credential={selectedCredential}
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
        onExport={handleExport}
        onShare={handleShare}
      />

      <ShareModal credential={selectedCredential} open={shareModalOpen} onOpenChange={setShareModalOpen} />
    </>
  )
}
