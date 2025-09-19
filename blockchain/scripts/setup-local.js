const { ethers } = require("hardhat")

async function main() {
  console.log("Setting up local development environment...")

  const [deployer, issuer1, issuer2, user1, user2] = await ethers.getSigners()

  // Get deployed contract addresses (you'll need to update these after deployment)
  const CREDENTIAL_REGISTRY_ADDRESS = process.env.CREDENTIAL_REGISTRY_ADDRESS
  const VERIFICATION_ORACLE_ADDRESS = process.env.VERIFICATION_ORACLE_ADDRESS

  if (!CREDENTIAL_REGISTRY_ADDRESS || !VERIFICATION_ORACLE_ADDRESS) {
    console.log("Please set contract addresses in environment variables first")
    console.log("Run deployment script first, then update .env file")
    return
  }

  // Get contract instances
  const credentialRegistry = await ethers.getContractAt("CredentialRegistry", CREDENTIAL_REGISTRY_ADDRESS)
  const verificationOracle = await ethers.getContractAt("VerificationOracle", VERIFICATION_ORACLE_ADDRESS)

  console.log("Setting up test data...")

  // Authorize additional issuers
  console.log("Authorizing issuers...")
  await credentialRegistry.authorizeIssuer(issuer1.address, "University of Technology")
  await credentialRegistry.authorizeIssuer(issuer2.address, "Professional Certification Board")

  // Authorize oracle
  console.log("Authorizing oracle...")
  await verificationOracle.authorizeOracle(issuer1.address)

  // Issue some test credentials
  console.log("Issuing test credentials...")

  const testCredentials = [
    {
      hash: ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test-credential-1")),
      metadata: ethers.utils.keccak256(ethers.utils.toUtf8Bytes("metadata-1")),
      owner: user1.address,
      expires: Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60, // 1 year
      code: "TEST-CERT-001",
    },
    {
      hash: ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test-credential-2")),
      metadata: ethers.utils.keccak256(ethers.utils.toUtf8Bytes("metadata-2")),
      owner: user2.address,
      expires: 0, // No expiration
      code: "TEST-CERT-002",
    },
  ]

  for (let i = 0; i < testCredentials.length; i++) {
    const cred = testCredentials[i]
    const issuerContract = credentialRegistry.connect(i === 0 ? issuer1 : issuer2)

    const tx = await issuerContract.issueCredential(cred.hash, cred.metadata, cred.owner, cred.expires, cred.code)

    const receipt = await tx.wait()
    console.log(`Issued credential ${i + 1}: ${cred.code}`)
  }

  // Test verification
  console.log("\nTesting verification...")
  const verificationResult = await credentialRegistry.verifyCredential("TEST-CERT-001")
  console.log("Verification result:", {
    isValid: verificationResult.isValid,
    credentialId: verificationResult.credentialId.toString(),
    issuer: verificationResult.issuer,
    owner: verificationResult.owner,
    organization: verificationResult.organization,
  })

  console.log("\nLocal setup completed successfully!")
  console.log("\nTest credentials created:")
  console.log("- TEST-CERT-001 (expires in 1 year)")
  console.log("- TEST-CERT-002 (no expiration)")

  console.log("\nAuthorized issuers:")
  console.log(`- ${issuer1.address} (University of Technology)`)
  console.log(`- ${issuer2.address} (Professional Certification Board)`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
