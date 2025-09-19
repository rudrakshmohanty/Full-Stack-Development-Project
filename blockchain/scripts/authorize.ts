import { ethers } from "hardhat";

async function main() {
  const issuerAddressToAuthorize = "0x3FAeed01621C386040BbC7b3FeC96D163E73dCe9";
  const organizationName = "New Authorized Issuer";

  const contractAddress = process.env.NEXT_PUBLIC_CREDENTIAL_CONTRACT_ADDRESS;
  if (!contractAddress) {
    console.error("Contract address not found in NEXT_PUBLIC_CREDENTIAL_CONTRACT_ADDRESS env variable.");
    process.exit(1);
  }

  console.log(
    `Authorizing issuer "${issuerAddressToAuthorize}" for organization "${organizationName}" on contract at ${contractAddress}`
  );

  const CredentialRegistry = await ethers.getContractFactory("CredentialRegistry");
  const credentialRegistry = CredentialRegistry.attach(contractAddress);

  const [deployer] = await ethers.getSigners();
  console.log("Using deployer account:", deployer.address);

  const tx = await credentialRegistry.connect(deployer).authorizeIssuer(issuerAddressToAuthorize, organizationName);
  console.log(`Transaction sent... hash: ${tx.hash}`);

  await tx.wait();

  console.log("Issuer authorized successfully!");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
