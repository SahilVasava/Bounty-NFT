import { ethers } from "hardhat";

async function main() {
  // We get the contract to deploy
  const BountyNFT = await ethers.getContractFactory("BountyNFT");
  const bountyNFT = await BountyNFT.deploy();

  await bountyNFT.deployed();

  console.log("BountyNFT deployed to:", bountyNFT.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
