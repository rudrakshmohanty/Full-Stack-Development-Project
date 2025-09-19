// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./CredentialRegistry.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CredentialFactory
 * @dev Factory contract for creating and managing multiple credential registries
 */
contract CredentialFactory is Ownable, ReentrancyGuard {
    
    // Array of all created registries
    address[] public registries;
    
    // Mapping from organization to their registry
    mapping(string => address) public organizationRegistries;
    
    // Mapping to track registry owners
    mapping(address => address) public registryOwners;
    
    // Events
    event RegistryCreated(
        address indexed registry,
        string indexed organization,
        address indexed owner
    );
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Create a new credential registry for an organization
     * @param _organization Name of the organization
     */
    function createRegistry(string memory _organization) 
        external 
        nonReentrant 
        returns (address) 
    {
        require(bytes(_organization).length > 0, "Invalid organization name");
        require(organizationRegistries[_organization] == address(0), "Registry already exists");
        
        CredentialRegistry newRegistry = new CredentialRegistry();
        address registryAddress = address(newRegistry);
        
        // Transfer ownership to the caller
        newRegistry.transferOwnership(msg.sender);
        
        registries.push(registryAddress);
        organizationRegistries[_organization] = registryAddress;
        registryOwners[registryAddress] = msg.sender;
        
        emit RegistryCreated(registryAddress, _organization, msg.sender);
        
        return registryAddress;
    }
    
    /**
     * @dev Get registry address for an organization
     * @param _organization Name of the organization
     */
    function getRegistry(string memory _organization) 
        external 
        view 
        returns (address) 
    {
        return organizationRegistries[_organization];
    }
    
    /**
     * @dev Get all registries
     */
    function getAllRegistries() external view returns (address[] memory) {
        return registries;
    }
    
    /**
     * @dev Get total number of registries
     */
    function getTotalRegistries() external view returns (uint256) {
        return registries.length;
    }
    
    /**
     * @dev Get registry owner
     * @param _registry Address of the registry
     */
    function getRegistryOwner(address _registry) external view returns (address) {
        return registryOwners[_registry];
    }
}
