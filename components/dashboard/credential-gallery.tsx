"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Download, Share, MoreVertical, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { CredentialViewModal } from "@/components/modals/credential-view-modal"
import { ShareModal } from "@/components/modals/share-modal"
import { useToast } from "@/hooks/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

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

export function CredentialGallery() {
  const [credentials, setCredentials] = useState<Credential[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCredential, setSelectedCredential] = useState<Credential | null>(null)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchCredentials()
  }, [])

  const fetchCredentials = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Authentication token not found")
        setLoading(false)
        return
      }

      const response = await fetch("http://localhost:5001/api/credentials", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch credentials")
      }

      setCredentials(data.credentials || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load credentials")
    } finally {
      setLoading(false)
    }
  }

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

  const handleView = (credential: Credential) => {
    setSelectedCredential(credential)
    setViewModalOpen(true)
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
      a.download = `${credential.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.pdf`
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

  const handleShare = (credential: Credential) => {
    setSelectedCredential(credential)
    setShareModalOpen(true)
  }

  const handleDelete = async (credential: Credential) => {
    if (!confirm(`Are you sure you want to delete "${credential.title}"? This action cannot be undone.`)) {
      return
    }

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:5001/api/credentials/${credential._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete credential")
      }

      setCredentials((prev) => prev.filter((c) => c._id !== credential._id))
      toast({
        title: "Credential deleted",
        description: "The credential has been permanently deleted.",
      })
    } catch (err) {
      toast({
        title: "Delete failed",
        description: err instanceof Error ? err.message : "Failed to delete credential.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="bg-gray-800/50 border-purple-500/20 animate-pulse">
            <CardHeader className="pb-3">
              <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-700 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-3 bg-gray-700 rounded w-full"></div>
                <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                <div className="flex justify-between items-center">
                  <div className="h-6 bg-gray-700 rounded w-20"></div>
                  <div className="h-6 bg-gray-700 rounded w-16"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className="bg-red-500/10 border-red-500/20">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-red-300 mb-4">Failed to load credentials</p>
            <p className="text-sm text-gray-400 mb-4">{error}</p>
            <Button onClick={fetchCredentials} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (credentials.length === 0) {
    return (
      <Card className="bg-gray-800/50 border-purple-500/20">
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Eye className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No credentials yet</h3>
            <p className="text-gray-400 mb-4">Upload your first credential to get started</p>
            <Button asChild>
              <a href="/dashboard/upload">Upload Credential</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {credentials.map((credential) => (
          <Card
            key={credential._id}
            className="bg-gray-800/50 border-purple-500/20 hover:border-purple-500/40 transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/10"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-white text-lg leading-tight mb-1">{credential.title}</CardTitle>
                  <CardDescription className="text-gray-400 text-sm">by {credential.issuer_name}</CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                    <DropdownMenuItem onClick={() => handleView(credential)} className="text-gray-300 hover:text-white">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleExport(credential)}
                      className="text-gray-300 hover:text-white"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleShare(credential)}
                      className="text-gray-300 hover:text-white"
                    >
                      <Share className="w-4 h-4 mr-2" />
                      Share
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(credential)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-300 line-clamp-2">
                  {credential.credential_data?.description || "No description available"}
                </p>
                {credential.credential_data?.organization && (
                  <p className="text-xs text-gray-400 mt-1">{credential.credential_data.organization}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
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
              </div>

              <div className="text-xs text-gray-400 border-t border-gray-700 pt-3">
                Issued: {new Date(credential.issue_date).toLocaleDateString()}
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-transparent"
                  onClick={() => handleView(credential)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-transparent"
                  onClick={() => handleExport(credential)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleShare(credential)}>
                  <Share className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
