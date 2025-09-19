const { ethers, run } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Starting deployment...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Get account balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  // Deploy CredentialRegistry
  console.log("\nDeploying CredentialRegistry...");
  const CredentialRegistry = await ethers.getContractFactory("CredentialRegistry");
  const credentialRegistry = await CredentialRegistry.deploy();
  await credentialRegistry.waitForDeployment();
  console.log("CredentialRegistry deployed to:", await credentialRegistry.getAddress());

  // Deploy CredentialFactory
  console.log("\nDeploying CredentialFactory...");
  const CredentialFactory = await ethers.getContractFactory("CredentialFactory");
  const credentialFactory = await CredentialFactory.deploy();
  await credentialFactory.waitForDeployment();
  console.log("CredentialFactory deployed to:", await credentialFactory.getAddress());

  // Deploy VerificationOracle
  console.log("\nDeploying VerificationOracle...");
  const VerificationOracle = await ethers.getContractFactory("VerificationOracle");
  const verificationOracle = await VerificationOracle.deploy();
  await verificationOracle.waitForDeployment();
  console.log("VerificationOracle deployed to:", await verificationOracle.getAddress());

  // Save deployment addresses
  const network = await ethers.provider.getNetwork();
  const deploymentInfo = {
    network: {
        name: network.name,
        chainId: Number(network.chainId)
    },
    deployer: deployer.address,
    contracts: {
      CredentialRegistry: await credentialRegistry.getAddress(),
      CredentialFactory: await credentialFactory.getAddress(),
      VerificationOracle: await verificationOracle.getAddress(),
    },
    deploymentTime: new Date().toISOString(),
  };

  console.log("\n=== Deployment Summary ===");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Verify contracts on Etherscan (if not local network)
  if (deploymentInfo.network.chainId !== 1337 && deploymentInfo.network.chainId !== 31337) {
    console.log("\nWaiting for block confirmations...");
    await credentialRegistry.deployTransaction.wait(6);
    await credentialFactory.deployTransaction.wait(6);
    await verificationOracle.deployTransaction.wait(6);

    console.log("Verifying contracts on Etherscan...");
    try {
      await run("verify:verify", {
        address: await credentialRegistry.getAddress(),
        constructorArguments: [],
      });

      await run("verify:verify", {
        address: await credentialFactory.getAddress(),
        constructorArguments: [],
      });

      await run("verify:verify", {
        address: await verificationOracle.getAddress(),
        constructorArguments: [],
      });

      console.log("Contracts verified successfully!");
    } catch (error: any) {
      console.log("Verification failed:", error.message);
    }
  }

  // Save deployment info to file
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const filename = `deployment-${deploymentInfo.network.chainId}-${Date.now()}.json`;
  fs.writeFileSync(path.join(deploymentsDir, filename), JSON.stringify(deploymentInfo, null, 2));

  console.log(`\nDeployment info saved to: deployments/${filename}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });