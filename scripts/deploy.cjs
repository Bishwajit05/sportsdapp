// scripts/deploy.cjs
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  // Get the contract factory
  const SportsMarketplace = await ethers.getContractFactory("SportsMarketplace");
  
  // Deploy the contract
  const sportsMarketplace = await SportsMarketplace.deploy();
  await sportsMarketplace.deployed();
  
  console.log("SportsMarketplace deployed to:", sportsMarketplace.address);
  
  // Save the contract address for frontend use
  const contractsDir = path.join(__dirname, "../src/utils");
  
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }
  
  // Write the contract address to a file
  fs.writeFileSync(
    path.join(contractsDir, "contractAddress.json"),
    JSON.stringify({ SportsMarketplace: sportsMarketplace.address }, null, 2)
  );
  
  console.log("Contract address saved to src/utils/contractAddress.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });