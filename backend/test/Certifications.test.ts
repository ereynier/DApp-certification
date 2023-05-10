import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect, assert } from "chai";
import { ethers } from "hardhat";
import { Certifications } from "../typechain-types/contracts/Certifications";

describe("Certifications", function () {
    let contract : Certifications;

    before(async function () {
        [this.owner, this.addr1, this.addr2, this.addr3, ...this.addrs] = await ethers.getSigners();
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
            await expect(contract.connect(this.owner).renounceRole(await contract.CERTIFIER_ADMIN(), this.owner.address)).to.be.revertedWith("You can't renounce to your role. Please contact admins");     
        });
    });

    describe("grantRole", function () {
        it("Should revert with message account AccessControl: role 0x00 required", async function () {
            await expect(contract.connect(this.owner).grantRole(contract.CERTIFIER(), this.owner.address)).to.be.revertedWith(/AccessControl: account .* is missing role 0x0000000000000000000000000000000000000000000000000000000000000000/);

        });
    });

    describe("revokeRole", function () {
        it("Should revert with message account AccessControl: role 0x00 required", async function () {
            expect(contract.connect(this.owner).grantRole(contract.CERTIFIER_ADMIN(), this.addr1.address)).to.be.revertedWith(/AccessControl: account .* is missing role 0x0000000000000000000000000000000000000000000000000000000000000000/);
        });
    });

    describe("revokeAnyRole", function () {
        it("Should revert with message 'Min CERTIFIER_ADMIN reached'", async function () {
            await expect(contract.connect(this.owner).revokeAnyRole(await contract.CERTIFIER_ADMIN(), this.addr1.address)).to.be.revertedWith(/Min .* reached/);
        });
    });

    describe("grantAnyRole", function () {
        it("Should revert with message 'Caller is not a CERTIFIER admin'", async function () {
            await expect(contract.connect(this.addr2).grantAnyRole(await contract.CERTIFIER(), this.addr3.address)).to.be.revertedWith(/Caller is not a .* admin/);
        });
        it("Should revert with message 'Caller is not a CERTIFIER_ADMIN admin'", async function () {
            await expect(contract.connect(this.addr2).grantAnyRole(await contract.CERTIFIER_ADMIN(), this.addr3.address)).to.be.revertedWith(/Caller is not a .* admin/);
        });
        it("Should revert with message 'This address is already a CERTIFIER_ADMIN'", async function () {
            await expect(contract.connect(this.owner).grantAnyRole(await contract.CERTIFIER_ADMIN(), this.addr1.address)).to.be.revertedWith(/This address is already a .*/);
        });

        it("Should not give the role CERTIFIER to the address addr2", async function () {
            expect(await contract.hasRole(await contract.CERTIFIER(), this.addr2.address)).to.equal(false);
            await contract.connect(this.owner).grantAnyRole(await contract.CERTIFIER(), this.addr2.address);
            expect(await contract.hasRole(await contract.CERTIFIER(), this.addr2.address)).to.equal(false);
        });

        it("Should give the role CERTIFIER to the address addr2", async function () {
            await contract.connect(this.addr1).grantAnyRole(await contract.CERTIFIER(), this.addr2.address);
            expect(await contract.hasRole(await contract.CERTIFIER(), this.addr2.address)).to.equal(true);
        });

        it("Should not give the role CERTIFIER_ADMIN to the address addr2", async function () {
            await contract.connect(this.owner).grantAnyRole(await contract.CERTIFIER_ADMIN(), this.addr2.address);
            expect(await contract.hasRole(await contract.CERTIFIER_ADMIN(), this.addr2.address)).to.equal(false);
        });
        it("Should give the role CERTIFIER_ADMIN to the address addr2", async function () {
            await contract.connect(this.addr1).grantAnyRole(await contract.CERTIFIER_ADMIN(), this.addr2.address);
            expect(await contract.hasRole(await contract.CERTIFIER_ADMIN(), this.addr2.address)).to.equal(true);
        });
        it("Should not give the role CERTIFIER to the address addr3", async function () {
            await contract.connect(this.owner).grantAnyRole(await contract.CERTIFIER(), this.addr3.address);
            await contract.connect(this.addr1).grantAnyRole(await contract.CERTIFIER(), this.addr3.address);
            expect(await contract.hasRole(await contract.CERTIFIER(), this.addr3.address)).to.equal(false);
            await contract.connect(this.owner).grantAnyRole(await contract.CERTIFIER(), this.addr3.address);
            expect(await contract.hasRole(await contract.CERTIFIER(), this.addr3.address)).to.equal(false);
        });
        it("Should give the role CERTIFIER to the address addr3", async function () {
            await contract.connect(this.addr2).grantAnyRole(await contract.CERTIFIER(), this.addr3.address);
            expect(await contract.hasRole(await contract.CERTIFIER(), this.addr3.address)).to.equal(true);
        });
    });
    
    describe("revokeAnyRole", function () {
        it("Should revert with message 'Caller is not a CERTIFIER admin'", async function () {
            await expect(contract.connect(this.addr3).revokeAnyRole(await contract.CERTIFIER(), this.addr3.address)).to.be.revertedWith(/Caller is not a .* admin/);  
        });
        it("Should revert with message 'Caller is not a CERTIFIER_ADMIN admin'", async function () {
            await expect(contract.connect(this.addr3).revokeAnyRole(await contract.CERTIFIER_ADMIN(), this.addr1.address)).to.be.revertedWith(/Caller is not a .* admin/);
        });
        it("Should revert with message 'This address is not a CERTIFIER_ADMIN'", async function () {
            await expect(contract.connect(this.owner).revokeAnyRole(await contract.CERTIFIER_ADMIN(), this.addr3.address)).to.be.revertedWith(/This address is not a .*/);
        });

        it("Should not revoke the role CERTIFIER to the address addr3", async function () {
            expect(await contract.hasRole(await contract.CERTIFIER(), this.addr3.address)).to.equal(true);
            await contract.connect(this.owner).revokeAnyRole(await contract.CERTIFIER(), this.addr3.address);
            expect(await contract.hasRole(await contract.CERTIFIER(), this.addr3.address)).to.equal(true);
            await contract.connect(this.addr1).revokeAnyRole(await contract.CERTIFIER(), this.addr3.address);
            expect(await contract.hasRole(await contract.CERTIFIER(), this.addr3.address)).to.equal(true);
        });
        it("Should revoke the role CERTIFIER to the address addr3", async function () {
            await contract.connect(this.addr2).revokeAnyRole(await contract.CERTIFIER(), this.addr3.address);
            expect(await contract.hasRole(await contract.CERTIFIER(), this.addr3.address)).to.equal(false);
        });
    });

});
