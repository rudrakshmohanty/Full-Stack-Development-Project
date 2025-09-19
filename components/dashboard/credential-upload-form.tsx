"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal, Mail, Upload, FileText, X, Building, Calendar, Tag, CheckCircle, Copy } from "lucide-react"
import { useDropzone } from "react-dropzone"
import { ethers } from "ethers"

// Type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

export function CredentialUploadForm() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<{
    verificationCode: string
    blockchainHash: string
  } | null>(null)
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    title: "",
    recipient_address: "",
    description: "",
    credentialType: "",
    issuerName: "",
    issuerOrganization: "",
    issueDate: "",
    expiryDate: "",
    tags: "",
    isPublic: false,
  })

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setUploadedFile(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.recipient_address) {
      setError("Please fill in all required fields.")
      return
    }
    if (!ethers.isAddress(formData.recipient_address)) {
      setError("Invalid recipient Ethereum address.")
      return
    }

    setIsUploading(true)
    setError(null)
    setUploadSuccess(null)

    try {
      // Metamask integration
      if (!window.ethereum) throw new Error("Metamask is not installed.")
      await window.ethereum.request({ method: "eth_requestAccounts" })
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()

      // Load contract ABI and address
      const contractAddress = process.env.NEXT_PUBLIC_CREDENTIAL_CONTRACT_ADDRESS || ""
      if (!contractAddress) throw new Error("Smart contract address not set. Please configure NEXT_PUBLIC_CREDENTIAL_CONTRACT_ADDRESS in your environment.")
      const contractAbi = require("@/blockchain/artifacts/blockchain/contracts/CredentialRegistry.sol/CredentialRegistry.json").abi
      const contract = new ethers.Contract(contractAddress, contractAbi, signer)

      // Prepare credential data for hashing
      const credentialData = {
        title: formData.title,
        type: formData.credentialType,
        issuerName: formData.issuerName,
        issueDate: formData.issueDate,
      };

      const metadata = {
        description: formData.description,
        issuerOrganization: formData.issuerOrganization,
        tags: formData.tags.split(",").map((tag) => tag.trim()),
        isPublic: formData.isPublic,
      };

      // Create hashes
      const credentialHash = ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(credentialData)));
      const metadataHash = ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(metadata)));

      // Generate verification code
      const verificationCode = ethers.hexlify(ethers.randomBytes(32));

      // Handle expiration date
      const expiresAt = formData.expiryDate ? Math.floor(new Date(formData.expiryDate).getTime() / 1000) : 0;

      // Call contract to issue credential
      const tx = await contract.issueCredential(
        credentialHash,
        metadataHash,
        formData.recipient_address,
        expiresAt,
        verificationCode
      )
      const receipt = await tx.wait()

      // Extract verification code from event
      const event = receipt.logs.find((log: any) => log.fragment && log.fragment.name === 'CredentialIssued');
      const emittedVerificationCode = event?.args?.verificationCode || "";
      const blockchainHash = receipt.hash

      // Convert image to base64
      console.log('Converting image to base64...');
      if (!uploadedFile) {
        throw new Error('No file selected');
      }
      const imageBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(uploadedFile);
      });

      // Save credential to MongoDB
      console.log('Saving credential to database...');
      try {
        const response = await fetch('http://localhost:5001/api/credentials', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Accept': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            title: formData.title,
            recipient_email: formData.recipient_address,
            credential_data: {
              type: formData.credentialType,
              issuerName: formData.issuerName,
              issuerOrganization: formData.issuerOrganization,
              description: formData.description,
              tags: formData.tags.split(",").map(tag => tag.trim()),
              isPublic: formData.isPublic
            },
            transaction_hash: blockchainHash,
            expiry_date: formData.expiryDate || null,
            verification_code: emittedVerificationCode,
            image: imageBase64  // Include the image in base64 format
          })
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        const responseText = await response.text();
        console.log('Raw response:', responseText);

        let dbResult;
        try {
          dbResult = JSON.parse(responseText);
        } catch (e) {
          console.error('Failed to parse response as JSON:', responseText);
          throw new Error(`Invalid server response. Status: ${response.status}. Response: ${responseText.substring(0, 200)}`);
        }

        if (!response.ok) {
          throw new Error(dbResult.error || `Failed to save credential to database. Status: ${response.status}`);
        }

        console.log('Database save result:', dbResult);

        setUploadSuccess({
          verificationCode: emittedVerificationCode,
          blockchainHash,
        });
      } catch (err: any) {
        console.error('Failed to save credential:', err);
        throw new Error(err.message || 'Failed to save credential to database');
      }

      toast({
        title: "Upload successful! 🎉",
        description: "Your credential has been uploaded and saved.",
      })

      setFormData({
        title: "",
        recipient_address: "",
        description: "",
        credentialType: "",
        issuerName: "",
        issuerOrganization: "",
        issueDate: "",
        expiryDate: "",
        tags: "",
        isPublic: false,
      })
      setUploadedFile(null)
    } catch (err: any) {
      let message = err.message;
      if (err.data && err.data.message) {
        message = err.data.message;
      } else if (err.reason) {
        message = err.reason;
      }
      setError(message)
    } finally {
      setIsUploading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "Copied to clipboard",
    })
  }

  const removeFile = () => {
    setUploadedFile(null)
  }

  return (
    <div className="space-y-8">
      {uploadSuccess && (
        <Card className="border-green-500/20 bg-green-500/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-400">
              <CheckCircle className="size-5" />
              Credential Successfully Uploaded & Verified!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-green-300">Verification Code</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={uploadSuccess.verificationCode}
                  readOnly
                  className="bg-green-900/20 border-green-500/20 text-green-100 font-mono"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(uploadSuccess.verificationCode)}
                  className="border-green-500/20 hover:bg-green-500/10"
                >
                  <Copy className="size-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-green-300">Blockchain Hash</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={uploadSuccess.blockchainHash}
                  readOnly
                  className="bg-green-900/20 border-green-500/20 text-green-100 font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(uploadSuccess.blockchainHash)}
                  className="border-green-500/20 hover:bg-green-500/10"
                >
                  <Copy className="size-4" />
                </Button>
              </div>
            </div>
            <p className="text-sm text-green-300">
              Your credential is now verified on the blockchain. Share the verification code with others to prove
              authenticity.
            </p>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="size-5" />
              Upload Credential Image
            </CardTitle>
            <CardDescription>
              Upload a clear image of your credential. Supported formats: PNG, JPG, JPEG, GIF, WebP (max 10MB)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!uploadedFile ? (
              <div
                {...getRootProps()}
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                  isDragActive
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-accent/50",
                )}
              >
                <input {...getInputProps()} />
                <Upload className="size-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">
                  {isDragActive ? "Drop your file here" : "Drag & drop your credential"}
                </p>
                <p className="text-muted-foreground mb-4">or click to browse files</p>
                <Button type="button" variant="outline">
                  Choose File
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-4 p-4 border rounded-lg bg-accent/50">
                <FileText className="size-8 text-primary" />
                <div className="flex-1">
                  <p className="font-medium">{uploadedFile.name}</p>
                  <p className="text-sm text-muted-foreground">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={removeFile}>
                  <X className="size-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-5" />
              Credential Information
            </CardTitle>
            <CardDescription>
              Provide details about your credential for better organization and verification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Credential Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Bachelor of Computer Science"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipient_address">Recipient Address *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="recipient_address"
                    type="text"
                    placeholder="e.g., 0x..."
                    className="pl-10"
                    value={formData.recipient_address}
                    onChange={(e) => setFormData((prev) => ({ ...prev, recipient_address: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="credentialType">Type *</Label>
                <Select
                  value={formData.credentialType}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, credentialType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select credential type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="certificate">Certificate</SelectItem>
                    <SelectItem value="diploma">Diploma</SelectItem>
                    <SelectItem value="license">License</SelectItem>
                    <SelectItem value="badge">Badge</SelectItem>
                    <SelectItem value="award">Award</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the credential..."
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="issuerName">Issuer Name *</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="issuerName"
                    placeholder="e.g., University of Technology"
                    className="pl-10"
                    value={formData.issuerName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, issuerName: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="issuerOrganization">Organization</Label>
                <Input
                  id="issuerOrganization"
                  placeholder="e.g., Department of Computer Science"
                  value={formData.issuerOrganization}
                  onChange={(e) => setFormData((prev) => ({ ...prev, issuerOrganization: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="issueDate">Issue Date *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="issueDate"
                    type="date"
                    className="pl-10"
                    value={formData.issueDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, issueDate: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="expiryDate"
                    type="date"
                    className="pl-10"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, expiryDate: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (Optional)</Label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="tags"
                  placeholder="e.g., computer science, bachelor, university"
                  className="pl-10"
                  value={formData.tags}
                  onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
                />
              </div>
              <p className="text-sm text-muted-foreground">Separate tags with commas for better organization</p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPublic"
                className="rounded border-border"
                checked={formData.isPublic}
                onChange={(e) => setFormData((prev) => ({ ...prev, isPublic: e.target.checked }))}
              />
              <Label htmlFor="isPublic" className="text-sm">
                Make this credential publicly verifiable
              </Label>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end">
          <Button type="submit" disabled={!uploadedFile || isUploading} className="min-w-32">
            {isUploading ? "Uploading..." : "Upload & Verify"}
          </Button>
        </div>
      </form>
    </div>
  )
}
