// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title VerificationOracle
 * @dev Oracle contract for handling off-chain AI verification results
 */
contract VerificationOracle is Ownable, ReentrancyGuard {
    
    // Struct for verification requests
    struct VerificationRequest {
        uint256 id;
        address requester;
        bytes32 credentialHash;
        bytes32 submittedImageHash;
        uint256 timestamp;
        bool completed;
        bool verified;
        uint256 confidenceScore; // 0-10000 (representing 0-100.00%)
        string result;
    }
    
    // Counter for request IDs
    uint256 private _requestCounter;
    
    // Mapping from request ID to verification request
    mapping(uint256 => VerificationRequest) public verificationRequests;
    
    // Mapping to track authorized oracles
    mapping(address => bool) public authorizedOracles;
    
    // Fee for verification requests
    uint256 public verificationFee = 0.001 ether;
    
    // Events
    event VerificationRequested(
        uint256 indexed requestId,
        address indexed requester,
        bytes32 credentialHash,
        bytes32 submittedImageHash
    );
    
    event VerificationCompleted(
        uint256 indexed requestId,
        bool verified,
        uint256 confidenceScore,
        string result
    );
    
    event OracleAuthorized(address indexed oracle);
    event OracleRevoked(address indexed oracle);
    event FeeUpdated(uint256 newFee);
    
    // Modifiers
    modifier onlyAuthorizedOracle() {
        require(authorizedOracles[msg.sender], "Not authorized oracle");
        _;
    }
    
    modifier requestExists(uint256 _requestId) {
        require(_requestId > 0 && _requestId <= _requestCounter, "Request does not exist");
        _;
    }
    
    constructor() Ownable(msg.sender) {
        // Owner is automatically authorized as oracle
        authorizedOracles[msg.sender] = true;
    }
    
    /**
     * @dev Request AI verification for a credential
     * @param _credentialHash Hash of the original credential
     * @param _submittedImageHash Hash of the submitted image for verification
     */
    function requestVerification(
        bytes32 _credentialHash,
        bytes32 _submittedImageHash
    ) external payable nonReentrant returns (uint256) {
        require(msg.value >= verificationFee, "Insufficient fee");
        require(_credentialHash != bytes32(0), "Invalid credential hash");
        require(_submittedImageHash != bytes32(0), "Invalid submitted image hash");
        
        _requestCounter++;
        uint256 requestId = _requestCounter;
        
        verificationRequests[requestId] = VerificationRequest({
            id: requestId,
            requester: msg.sender,
            credentialHash: _credentialHash,
            submittedImageHash: _submittedImageHash,
            timestamp: block.timestamp,
            completed: false,
            verified: false,
            confidenceScore: 0,
            result: ""
        });
        
        emit VerificationRequested(requestId, msg.sender, _credentialHash, _submittedImageHash);
        
        return requestId;
    }
    
    /**
     * @dev Submit verification result (called by authorized oracle)
     * @param _requestId ID of the verification request
     * @param _verified Whether the credential is verified
     * @param _confidenceScore Confidence score (0-10000)
     * @param _result Detailed result string
     */
    function submitVerificationResult(
        uint256 _requestId,
        bool _verified,
        uint256 _confidenceScore,
        string memory _result
    ) external onlyAuthorizedOracle requestExists(_requestId) {
        VerificationRequest storage request = verificationRequests[_requestId];
        require(!request.completed, "Request already completed");
        require(_confidenceScore <= 10000, "Invalid confidence score");
        
        request.completed = true;
        request.verified = _verified;
        request.confidenceScore = _confidenceScore;
        request.result = _result;
        
        emit VerificationCompleted(_requestId, _verified, _confidenceScore, _result);
    }
    
    /**
     * @dev Get verification request details
     * @param _requestId ID of the request
     */
    function getVerificationRequest(uint256 _requestId) 
        external 
        view 
        requestExists(_requestId)
        returns (VerificationRequest memory) 
    {
        return verificationRequests[_requestId];
    }
    
    /**
     * @dev Authorize a new oracle
     * @param _oracle Address of the oracle to authorize
     */
    function authorizeOracle(address _oracle) external onlyOwner {
        require(_oracle != address(0), "Invalid oracle address");
        authorizedOracles[_oracle] = true;
        emit OracleAuthorized(_oracle);
    }
    
    /**
     * @dev Revoke oracle authorization
     * @param _oracle Address of the oracle to revoke
     */
    function revokeOracle(address _oracle) external onlyOwner {
        require(_oracle != owner(), "Cannot revoke contract owner");
        authorizedOracles[_oracle] = false;
        emit OracleRevoked(_oracle);
    }
    
    /**
     * @dev Update verification fee
     * @param _newFee New fee amount in wei
     */
    function updateVerificationFee(uint256 _newFee) external onlyOwner {
        verificationFee = _newFee;
        emit FeeUpdated(_newFee);
    }
    
    /**
     * @dev Withdraw contract balance
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }
    
    /**
     * @dev Get total number of verification requests
     */
    function getTotalRequests() external view returns (uint256) {
        return _requestCounter;
    }
}
