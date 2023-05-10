import { ethers, network } from "hardhat";
import { verify } from "../utils/verify";

async function main() {
  const Certifications = await ethers.getContractFactory("Certifications");
  const certifications = await Certifications.deploy();

  await certifications.deployed();

  console.log("Certifications deployed to:", certifications.address);

  if (network.name !== "localhost" && network.name !== "hardhat") {
    console.log(`Verifying ${certifications.address} Etherscan...`);
    await certifications.deployTransaction.wait(6);
    await verify(certifications.address, []);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
