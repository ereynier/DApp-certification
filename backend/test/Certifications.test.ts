import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect, assert } from "chai";
import { ethers } from "hardhat";
import { Certifications } from "../typechain-types/contracts/Certifications";

describe("Certifications", function () {
    let contract : Certifications;

    before(async function () {
        [this.owner, this.addr1, this.addr2, ...this.addrs] = await ethers.getSigners();
        const Certifications = await ethers.getContractFactory("Certifications");
        contract = await Certifications.deploy(this.owner.address, this.addr1.address);
    });

    describe("Deployment", function () {
        it("Should set the right roles", async function () {
            expect(await contract.hasRole(await contract.CERTIFIER_ADMIN(), this.owner.address)).to.equal(true);
            expect(await contract.hasRole(await contract.CERTIFIER_ADMIN(), this.addr1.address)).to.equal(true);
        });
    });

    describe("renounceRole", function () {
        it("Should revert with message 'You can't renounce to your role. Please contact admins", async function () {
            expect(contract.connect(this.owner).renounceRole(await contract.CERTIFIER_ADMIN(), this.owner.address)).to.be.revertedWith("You can't renounce to your role. Please contact admins");     
        });
    });

    describe("grantRole", function () {
        it("Should revert with message account AccessControl: role 0x00 required", async function () {
            expect(contract.connect(this.owner).grantRole(contract.CERTIFIER(), this.owner.address)).to.be.revertedWith(`AccessControl: account ${this.owner.address} is missing role 0x0000000000000000000000000000000000000000000000000000000000000000`);

        });
    });

    describe("revokeRole", function () {
        it("Should revert with message account AccessControl: role 0x00 required", async function () {
            expect(contract.connect(this.owner).grantRole(contract.CERTIFIER_ADMIN(), this.addr1.address)).to.be.revertedWith(`AccessControl: account ${this.owner.address} is missing role 0x0000000000000000000000000000000000000000000000000000000000000000`);
        });
    });

    
});
