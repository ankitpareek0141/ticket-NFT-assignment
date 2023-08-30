// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  
  // Deploy FestToken contract (replace with actual implementation)
  const festToken = await hre.ethers.deployContract("FESTToken");
  console.log("FestToken deployed to:", await festToken.getAddress());
  
  // Deploy TicketMinter contract
  const ticketMinter = await hre.ethers.deployContract("TicketMinter", [
    await festToken.getAddress(), 
    hre.ethers.parseUnits("1", "ether")
  ]);
  console.log("TicketMinter deployed to:", await ticketMinter.getAddress());

  // Deploy Market contract
  const market = await hre.ethers.deployContract("Market", [
    30, 
    await festToken.getAddress(), 
    await ticketMinter.getAddress()
  ]);
  console.log("Market deployed to:", await market.getAddress());

  console.log("Deployment completed.");
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
