import { ethers, network } from "hardhat";
import { verify } from "../utils/verify";

async function main() {
  const Certifications = await ethers.getContractFactory("Certifications");
  const certifications = await Certifications.deploy("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", "0x70997970C51812dc3A010C7d01b50e0d17dc79C8");

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
