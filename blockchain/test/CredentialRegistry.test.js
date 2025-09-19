const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("CredentialRegistry", () => {
  let credentialRegistry
  let owner, issuer, user, unauthorized

  beforeEach(async () => {
    ;[owner, issuer, user, unauthorized] = await ethers.getSigners()

    const CredentialRegistry = await ethers.getContractFactory("CredentialRegistry")
    credentialRegistry = await CredentialRegistry.deploy()
    await credentialRegistry.deployed()

    // Authorize issuer
    await credentialRegistry.authorizeIssuer(issuer.address, "Test Organization")
  })

  describe("Deployment", () => {
    it("Should set the right owner", async () => {
      expect(await credentialRegistry.owner()).to.equal(owner.address)
    })

    it("Should authorize owner as issuer", async () => {
      expect(await credentialRegistry.isAuthorizedIssuer(owner.address)).to.be.true
    })
  })

  describe("Issuer Management", () => {
    it("Should authorize new issuer", async () => {
      await credentialRegistry.authorizeIssuer(user.address, "User Organization")
      expect(await credentialRegistry.isAuthorizedIssuer(user.address)).to.be.true
      expect(await credentialRegistry.getIssuerOrganization(user.address)).to.equal("User Organization")
    })

    it("Should revoke issuer", async () => {
      await credentialRegistry.revokeIssuer(issuer.address)
      expect(await credentialRegistry.isAuthorizedIssuer(issuer.address)).to.be.false
    })

    it("Should not allow non-owner to authorize issuer", async () => {
      await expect(
        credentialRegistry.connect(unauthorized).authorizeIssuer(user.address, "Test Org"),
      ).to.be.revertedWith("Ownable: caller is not the owner")
    })
  })

  describe("Credential Issuance", () => {
    const credentialHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test-credential"))
    const metadataHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test-metadata"))
    const verificationCode = "TEST-001"

    it("Should issue credential", async () => {
      const expiresAt = Math.floor(Date.now() / 1000) + 3600 // 1 hour

      await expect(
        credentialRegistry
          .connect(issuer)
          .issueCredential(credentialHash, metadataHash, user.address, expiresAt, verificationCode),
      ).to.emit(credentialRegistry, "CredentialIssued")

      const credential = await credentialRegistry.getCredential(1)
      expect(credential.credentialHash).to.equal(credentialHash)
      expect(credential.owner).to.equal(user.address)
      expect(credential.issuer).to.equal(issuer.address)
    })

    it("Should not allow unauthorized issuer", async () => {
      await expect(
        credentialRegistry
          .connect(unauthorized)
          .issueCredential(credentialHash, metadataHash, user.address, 0, verificationCode),
      ).to.be.revertedWith("Not authorized issuer")
    })

    it("Should not allow duplicate verification codes", async () => {
      await credentialRegistry
        .connect(issuer)
        .issueCredential(credentialHash, metadataHash, user.address, 0, verificationCode)

      await expect(
        credentialRegistry
          .connect(issuer)
          .issueCredential(
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes("different-credential")),
            metadataHash,
            user.address,
            0,
            verificationCode,
          ),
      ).to.be.revertedWith("Verification code already used")
    })
  })

  describe("Credential Verification", () => {
    const credentialHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test-credential"))
    const metadataHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test-metadata"))
    const verificationCode = "TEST-001"

    beforeEach(async () => {
      await credentialRegistry
        .connect(issuer)
        .issueCredential(credentialHash, metadataHash, user.address, 0, verificationCode)
    })

    it("Should verify valid credential", async () => {
      const result = await credentialRegistry.verifyCredential(verificationCode)
      expect(result.isValid).to.be.true
      expect(result.credentialHash).to.equal(credentialHash)
      expect(result.owner).to.equal(user.address)
      expect(result.organization).to.equal("Test Organization")
    })

    it("Should not verify invalid code", async () => {
      const result = await credentialRegistry.verifyCredential("INVALID-CODE")
      expect(result.isValid).to.be.false
      expect(result.credentialId).to.equal(0)
    })

    it("Should not verify revoked credential", async () => {
      await credentialRegistry.connect(issuer).revokeCredential(1)
      const result = await credentialRegistry.verifyCredential(verificationCode)
      expect(result.isValid).to.be.false
      expect(result.isRevoked).to.be.true
    })
  })

  describe("Credential Revocation", () => {
    const credentialHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test-credential"))
    const metadataHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test-metadata"))
    const verificationCode = "TEST-001"

    beforeEach(async () => {
      await credentialRegistry
        .connect(issuer)
        .issueCredential(credentialHash, metadataHash, user.address, 0, verificationCode)
    })

    it("Should allow issuer to revoke", async () => {
      await expect(credentialRegistry.connect(issuer).revokeCredential(1)).to.emit(
        credentialRegistry,
        "CredentialRevoked",
      )

      const credential = await credentialRegistry.getCredential(1)
      expect(credential.isRevoked).to.be.true
    })

    it("Should allow owner to revoke", async () => {
      await expect(credentialRegistry.connect(user).revokeCredential(1)).to.emit(
        credentialRegistry,
        "CredentialRevoked",
      )
    })

    it("Should not allow unauthorized revocation", async () => {
      await expect(credentialRegistry.connect(unauthorized).revokeCredential(1)).to.be.revertedWith(
        "Not authorized to revoke",
      )
    })
  })
})
