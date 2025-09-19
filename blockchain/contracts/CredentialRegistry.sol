// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title CredentialRegistry
 * @dev Smart contract for storing and verifying credential hashes on blockchain
 */
contract CredentialRegistry is Ownable, ReentrancyGuard, Pausable {
    
    // Counter for credential IDs
    uint256 private _credentialIds;
    
    // Struct to store credential information
    struct Credential {
        uint256 id;
        bytes32 credentialHash;
        bytes32 metadataHash;
        address issuer;
        address owner;
        uint256 issuedAt;
        uint256 expiresAt;
        bool isRevoked;
        string verificationCode;
    }
    
    // Mapping from credential ID to credential
    mapping(uint256 => Credential) public credentials;
    
    // Mapping from verification code to credential ID
    mapping(string => uint256) public verificationCodeToId;
    
    // Mapping from credential hash to credential ID
    mapping(bytes32 => uint256) public credentialHashToId;
    
    // Mapping to track authorized issuers
    mapping(address => bool) public authorizedIssuers;
    
    // Mapping to track issuer organizations
    mapping(address => string) public issuerOrganizations;
    
    // Events
    event CredentialIssued(
        uint256 indexed credentialId,
        bytes32 indexed credentialHash,
        address indexed issuer,
        address owner,
        string verificationCode
    );
    
    event CredentialRevoked(
        uint256 indexed credentialId,
        address indexed revokedBy,
        uint256 revokedAt
    );
    
    event IssuerAuthorized(
        address indexed issuer,
        string organization,
        address indexed authorizedBy
    );
    
    event IssuerRevoked(
        address indexed issuer,
        address indexed revokedBy
    );
    
    event CredentialVerified(
        uint256 indexed credentialId,
        address indexed verifier,
        uint256 verifiedAt
    );
    
    // Modifiers
    modifier onlyAuthorizedIssuer() {
        require(authorizedIssuers[msg.sender] || msg.sender == owner(), "Not authorized issuer");
        _;
    }
    
    modifier credentialExists(uint256 _credentialId) {
        require(_credentialId > 0 && _credentialId <= _credentialIds, "Credential does not exist");
        _;
    }
    
    modifier notRevoked(uint256 _credentialId) {
        require(!credentials[_credentialId].isRevoked, "Credential is revoked");
        _;
    }
    
    constructor() Ownable(msg.sender) {
        // Owner is automatically authorized as issuer
        authorizedIssuers[msg.sender] = true;
        issuerOrganizations[msg.sender] = "BlockCreds";
    }
    
    /**
     * @dev Issue a new credential
     * @param _credentialHash Hash of the credential data
     * @param _metadataHash Hash of the credential metadata
     * @param _owner Address of the credential owner
     * @param _expiresAt Expiration timestamp (0 for no expiration)
     * @param _verificationCode Unique verification code
     */
    function issueCredential(
        bytes32 _credentialHash,
        bytes32 _metadataHash,
        address _owner,
        uint256 _expiresAt,
        string memory _verificationCode
    ) external onlyAuthorizedIssuer whenNotPaused nonReentrant returns (uint256) {
        require(_credentialHash != bytes32(0), "Invalid credential hash");
        require(_owner != address(0), "Invalid owner address");
        require(bytes(_verificationCode).length > 0, "Invalid verification code");
        require(credentialHashToId[_credentialHash] == 0, "Credential already exists");
        require(verificationCodeToId[_verificationCode] == 0, "Verification code already used");
        
        if (_expiresAt > 0) {
            require(_expiresAt > block.timestamp, "Expiration date must be in the future");
        }
        
        _credentialIds++;
        uint256 credentialId = _credentialIds;
        
        credentials[credentialId] = Credential({
            id: credentialId,
            credentialHash: _credentialHash,
            metadataHash: _metadataHash,
            issuer: msg.sender,
            owner: _owner,
            issuedAt: block.timestamp,
            expiresAt: _expiresAt,
            isRevoked: false,
            verificationCode: _verificationCode
        });
        
        credentialHashToId[_credentialHash] = credentialId;
        verificationCodeToId[_verificationCode] = credentialId;
        
        emit CredentialIssued(credentialId, _credentialHash, msg.sender, _owner, _verificationCode);
        
        return credentialId;
    }
    
    /**
     * @dev Verify a credential by verification code
     * @param _verificationCode Verification code to check
     */
    function verifyCredential(string memory _verificationCode) 
        external 
        view 
        returns (
            bool isValid,
            uint256 credentialId,
            bytes32 credentialHash,
            address issuer,
            address owner,
            uint256 issuedAt,
            uint256 expiresAt,
            bool isRevoked,
            string memory organization
        ) 
    {
        credentialId = verificationCodeToId[_verificationCode];
        
        if (credentialId == 0) {
            return (false, 0, bytes32(0), address(0), address(0), 0, 0, false, "");
        }
        
        Credential memory cred = credentials[credentialId];
        
        // Check if credential is expired
        bool isExpired = cred.expiresAt > 0 && block.timestamp > cred.expiresAt;
        
        return (
            !cred.isRevoked && !isExpired,
            cred.id,
            cred.credentialHash,
            cred.issuer,
            cred.owner,
            cred.issuedAt,
            cred.expiresAt,
            cred.isRevoked,
            issuerOrganizations[cred.issuer]
        );
    }
    
    /**
     * @dev Verify a credential by hash
     * @param _credentialHash Hash to verify
     */
    function verifyCredentialByHash(bytes32 _credentialHash) 
        external 
        view 
        returns (bool isValid, uint256 credentialId) 
    {
        credentialId = credentialHashToId[_credentialHash];
        
        if (credentialId == 0) {
            return (false, 0);
        }
        
        Credential memory cred = credentials[credentialId];
        bool isExpired = cred.expiresAt > 0 && block.timestamp > cred.expiresAt;
        
        return (!cred.isRevoked && !isExpired, credentialId);
    }
    
    /**
     * @dev Revoke a credential
     * @param _credentialId ID of the credential to revoke
     */
    function revokeCredential(uint256 _credentialId) 
        external 
        credentialExists(_credentialId) 
        nonReentrant 
    {
        Credential storage cred = credentials[_credentialId];
        require(
            msg.sender == cred.issuer || 
            msg.sender == cred.owner || 
            msg.sender == owner(),
            "Not authorized to revoke"
        );
        require(!cred.isRevoked, "Credential already revoked");
        
        cred.isRevoked = true;
        
        emit CredentialRevoked(_credentialId, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Authorize a new issuer
     * @param _issuer Address of the issuer to authorize
     * @param _organization Organization name
     */
    function authorizeIssuer(address _issuer, string memory _organization) 
        external 
        onlyOwner 
    {
        require(_issuer != address(0), "Invalid issuer address");
        require(bytes(_organization).length > 0, "Invalid organization name");
        
        authorizedIssuers[_issuer] = true;
        issuerOrganizations[_issuer] = _organization;
        
        emit IssuerAuthorized(_issuer, _organization, msg.sender);
    }
    
    /**
     * @dev Revoke issuer authorization
     * @param _issuer Address of the issuer to revoke
     */
    function revokeIssuer(address _issuer) external onlyOwner {
        require(_issuer != owner(), "Cannot revoke contract owner");
        require(authorizedIssuers[_issuer], "Issuer not authorized");
        
        authorizedIssuers[_issuer] = false;
        delete issuerOrganizations[_issuer];
        
        emit IssuerRevoked(_issuer, msg.sender);
    }
    
    /**
     * @dev Get credential details by ID
     * @param _credentialId ID of the credential
     */
    function getCredential(uint256 _credentialId) 
        external 
        view 
        credentialExists(_credentialId)
        returns (Credential memory) 
    {
        return credentials[_credentialId];
    }
    
    /**
     * @dev Get total number of credentials issued
     */
    function getTotalCredentials() external view returns (uint256) {
        return _credentialIds;
    }
    
    /**
     * @dev Check if an address is an authorized issuer
     * @param _issuer Address to check
     */
    function isAuthorizedIssuer(address _issuer) external view returns (bool) {
        return authorizedIssuers[_issuer];
    }
    
    /**
     * @dev Get issuer organization name
     * @param _issuer Address of the issuer
     */
    function getIssuerOrganization(address _issuer) external view returns (string memory) {
        return issuerOrganizations[_issuer];
    }
    
    /**
     * @dev Emergency pause function
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause function
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Log verification event (for analytics)
     * @param _credentialId ID of the verified credential
     */
    function logVerification(uint256 _credentialId) 
        external 
        credentialExists(_credentialId) 
        notRevoked(_credentialId) 
    {
        emit CredentialVerified(_credentialId, msg.sender, block.timestamp);
    }
}
