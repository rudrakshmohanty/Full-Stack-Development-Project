'use client'

import type React from "react"
import { useState, useCallback } from "react"
import { ethers } from "ethers" // Import ethers
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Upload, Search, CheckCircle, XCircle, Download } from "lucide-react"
import { useDropzone } from "react-dropzone"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

// Add window.ethereum declaration
declare global {
  interface Window {
    ethereum?: any;
  }
}

// Updated interface
interface VerificationResult {
  verified: boolean;
  credential?: {
    credentialId: string;
    credentialHash: string;
    issuer: string;
    owner: string;
    issuedAt: string;
    expiresAt: string;
    isRevoked: boolean;
    organization: string;
    verification_code: string;
    imageMatchScore?: number;
  };
  message?: string;
}

export function VerificationForm() {
  const [verificationCode, setVerificationCode] = useState("")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null)
  const [progress, setProgress] = useState(0)
  const { toast } = useToast()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setUploadedFile(file)
      setVerificationResult(null)
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

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!verificationCode || !uploadedFile) {
      toast({
        title: "Error",
        description: !verificationCode ? "Please enter a verification code" : "Please upload an image of the credential",
        variant: "destructive",
      })
      return
    }

    setIsVerifying(true)
    setProgress(0)
    setVerificationResult(null)

    try {
      // Start verification process
      setProgress(20)
      
      // First verify with backend
      console.log('Preparing verification request...');
      const imageBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(uploadedFile);
      });

      console.log('Sending verification request to backend...');
      const backendResponse = await fetch('http://localhost:5001/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          verification_code: verificationCode,
          image: imageBase64,
        }),
      });

      if (!backendResponse.ok) {
        const errorData = await backendResponse.json();
        console.error('Backend verification failed:', errorData);
        throw new Error(errorData.error || 'Failed to verify credential');
      }

      const backendResult = await backendResponse.json();
      console.log('Backend verification response:', backendResult);
      setProgress(50)

      // Then verify on blockchain
      if (!window.ethereum) throw new Error("Metamask is not installed.");
      const provider = new ethers.BrowserProvider(window.ethereum);
      setProgress(60)

      const contractAddress = process.env.NEXT_PUBLIC_CREDENTIAL_CONTRACT_ADDRESS || "";
      if (!contractAddress) throw new Error("Smart contract address not set.");
      
      const contractAbi = require("@/blockchain/artifacts/blockchain/contracts/CredentialRegistry.sol/CredentialRegistry.json").abi;
      const contract = new ethers.Contract(contractAddress, contractAbi, provider);
      setProgress(70)

      console.log('Verifying on blockchain...');
      const blockchainResult = await contract.verifyCredential(verificationCode);
      console.log('Blockchain verification result:', blockchainResult);
      setProgress(90)

      const [blockchainValid, credentialId, credentialHash, issuer, owner, issuedAt, expiresAt, isRevoked, organization] = blockchainResult;

      setProgress(100)
      
      // Check if credential exists
      if (credentialId.toString() === "0") {
          throw new Error("Credential not found for the given verification code.");
      }

      const isValid = blockchainValid && backendResult.verification_result?.is_valid;
      
      setVerificationResult({
        verified: isValid,
        credential: {
          credentialId: credentialId.toString(),
          credentialHash: credentialHash.toString(),
          issuer: issuer.toString(),
          owner: owner.toString(),
          imageMatchScore: backendResult.verification_result?.confidence || 0,
          issuedAt: new Date(Number(issuedAt) * 1000).toISOString().split('T')[0],
          expiresAt: Number(expiresAt) > 0 ? new Date(Number(expiresAt) * 1000).toISOString().split('T')[0] : 'Never',
          isRevoked: isRevoked,
          organization: organization.toString(),
          verification_code: verificationCode,
        },
        message: !isValid ? (isRevoked ? "Credential has been revoked." : "Credential verification failed.") : undefined
      });

      toast({
        title: isValid ? "Verification Successful!" : "Verification Failed",
        description: isValid
          ? "The credential has been successfully verified."
          : "The credential could not be verified.",
        variant: isValid ? "default" : "destructive",
      });

    } catch (error: any) {
      let message = error.message;
      if (error.data && error.data.message) {
        message = error.data.message;
      } else if (error.reason) {
        message = error.reason;
      }
      setVerificationResult({
        verified: false,
        message: message,
      })
      toast({
        title: "Verification Error",
        description: message || "Failed to verify credential. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsVerifying(false)
      setProgress(0)
    }
  }

  const handleDownloadReport = () => {
    if (!verificationResult?.credential) return

    const reportData = {
      ...verificationResult.credential,
      verified_at: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `verification_report_${verificationResult.credential.verification_code}.json`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)

    toast({
      title: "Report Downloaded",
      description: "Verification report has been downloaded successfully.",
    })
  }

  const resetForm = () => {
    setVerificationCode("")
    setUploadedFile(null)
    setVerificationResult(null)
    setProgress(0)
  }

  return (
    <Card className="border-border/50 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl font-playfair">
          <Search className="size-6 text-primary" />
          Credential Verification
        </CardTitle>
        <CardDescription>
          Enter the verification code to verify credential authenticity on the blockchain
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!verificationResult ? (
          <form onSubmit={handleVerification} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="verificationCode">Verification Code</Label>
              <Input
                id="verificationCode"
                placeholder="Enter verification code (e.g., 0x...)"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
                disabled={isVerifying}
              />
              <p className="text-sm text-muted-foreground">
                The verification code can be found on the original credential or provided by the issuer
              </p>
            </div>

            <div className="space-y-2">
              <Label>Upload Credential Image (Optional)</Label>
              {!uploadedFile ? (
                <div
                  {...getRootProps()}
                  className={cn(
                    "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                    isDragActive
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-accent/50",
                    isVerifying && "pointer-events-none opacity-50",
                  )}
                >
                  <input {...getInputProps()} />
                  <Upload className="size-8 mx-auto mb-3 text-muted-foreground" />
                  <p className="font-medium mb-1">
                    {isDragActive ? "Drop your image here" : "Drag & drop credential image"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    or click to browse (PNG, JPG, JPEG, GIF, WebP - max 10MB)
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 border rounded-lg bg-accent/50">
                  <div className="size-12 rounded bg-primary/10 flex items-center justify-center">
                    <Upload className="size-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{uploadedFile.name}</p>
                    <p className="text-sm text-muted-foreground">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  {!isVerifying && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => setUploadedFile(null)}>
                      Remove
                    </Button>
                  )}
                </div>
              )}
            </div>

            {isVerifying && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Verification in progress...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={!verificationCode || isVerifying}>
              {isVerifying ? "Verifying..." : "Verify Credential"}
            </Button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-accent/50">
              {verificationResult.verified ? (
                <CheckCircle className="size-8 text-green-500" />
              ) : (
                <XCircle className="size-8 text-red-500" />
              )}
              <div>
                <h3 className="text-lg font-semibold">
                  {verificationResult.verified ? "Credential Verified" : "Verification Failed"}
                </h3>
                <p className="text-muted-foreground">
                  {verificationResult.verified
                    ? "This credential is authentic and verified on the blockchain"
                    : verificationResult.message || "This credential could not be verified"}
                </p>
              </div>
            </div>

            {verificationResult.verified && verificationResult.credential && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                <div>
                  <Label className="text-sm text-muted-foreground">Verification Code</Label>
                  <p className="font-medium font-mono break-all">{verificationResult.credential.verification_code}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Organization</Label>
                  <p className="font-medium">{verificationResult.credential.organization}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Issuer Address</Label>
                  <p className="font-medium font-mono break-all">{verificationResult.credential.issuer}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Owner Address</Label>
                  <p className="font-medium font-mono break-all">{verificationResult.credential.owner}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Issued At</Label>
                  <p className="font-medium">
                    {new Date(verificationResult.credential.issuedAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Expires At</Label>
                  <p className="font-medium">
                    {verificationResult.credential.expiresAt === "N/A" ? "N/A" : new Date(verificationResult.credential.expiresAt).toLocaleString()}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <Label className="text-sm text-muted-foreground">Status</Label>
                  <Badge className={cn(verificationResult.credential.isRevoked ? "bg-red-500/20 text-red-300" : "bg-green-500/20 text-green-300")}>
                    {verificationResult.credential.isRevoked ? "Revoked" : "Active"}
                  </Badge>
                </div>
                <div className="md:col-span-2">
                  <Label className="text-sm text-muted-foreground">Credential Hash</Label>
                  <p className="font-medium font-mono break-all">{verificationResult.credential.credentialHash}</p>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={resetForm} variant="outline" className="flex-1 bg-transparent">
                Verify Another Credential
              </Button>
              {verificationResult.verified && (
                <Button onClick={handleDownloadReport} className="flex-1">
                  <Download className="size-4 mr-2" />
                  Download Report
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}