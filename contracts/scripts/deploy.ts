import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying GuardianForgeAgent contract...");

  const GuardianForgeAgent = await ethers.getContractFactory("GuardianForgeAgent");
  const contract = await GuardianForgeAgent.deploy();

  await contract.waitForDeployment();

  const address = await contract.getAddress();
  
  console.log("✅ GuardianForgeAgent deployed to:", address);
  console.log("\n📋 Save this address for your .env file:");
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`);
  console.log(`\n🔗 Verify on PolygonScan:`);
  console.log(`https://amoy.polygonscan.com/address/${address}`);
  
  // Wait for a few block confirmations
  console.log("\n⏳ Waiting for block confirmations...");
  await contract.deploymentTransaction()?.wait(5);
  
  console.log("\n✅ Contract verified and ready!");
  console.log("\n📝 Next steps:");
  console.log("1. Copy the contract address above");
  console.log("2. Add it to frontend/.env.local");
  console.log("3. Add it to agent/.env");
  console.log("4. Run 'cd frontend && npm install && npm run dev'");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
