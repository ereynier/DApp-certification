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
            await expect(contract.connect(this.owner).revokeAnyRole(await contract.CERTIFIER_ADMIN(), this.addr1.address, true)).to.be.revertedWith(/Min .* reached/);
        });
    });

    describe("grantAnyRole", function () {
        it("Should revert with message 'Caller is not a CERTIFIER admin'", async function () {
            await expect(contract.connect(this.addr2).grantAnyRole(await contract.CERTIFIER(), this.addr3.address, true)).to.be.revertedWith(/Caller is not a .* admin/);
        });
        it("Should revert with message 'Caller is not a CERTIFIER_ADMIN admin'", async function () {
            await expect(contract.connect(this.addr2).grantAnyRole(await contract.CERTIFIER_ADMIN(), this.addr3.address, true)).to.be.revertedWith(/Caller is not a .* admin/);
        });
        it("Should revert with message 'This address is already a CERTIFIER_ADMIN'", async function () {
            await expect(contract.connect(this.owner).grantAnyRole(await contract.CERTIFIER_ADMIN(), this.addr1.address, true)).to.be.revertedWith(/This address is already a .*/);
        });

        it("Should not give the role CERTIFIER to the address addr2 with owner sign (50 / 80%)", async function () {
            expect(await contract.hasRole(await contract.CERTIFIER(), this.addr2.address)).to.equal(false);
            await contract.connect(this.owner).grantAnyRole(await contract.CERTIFIER(), this.addr2.address, true);
            expect(await contract.hasRole(await contract.CERTIFIER(), this.addr2.address)).to.equal(false);
        });

        it("Should give the role CERTIFIER to the address addr2 with owner and addr1 sign (100 / 80%)", async function () {
            await contract.connect(this.addr1).grantAnyRole(await contract.CERTIFIER(), this.addr2.address, true);
            expect(await contract.hasRole(await contract.CERTIFIER(), this.addr2.address)).to.equal(true);
        });

        it("Should not give the role CERTIFIER_ADMIN to the address addr2 with only owner sign (50 / 80%)", async function () {
            await contract.connect(this.owner).grantAnyRole(await contract.CERTIFIER_ADMIN(), this.addr2.address, true);
            expect(await contract.hasRole(await contract.CERTIFIER_ADMIN(), this.addr2.address)).to.equal(false);
        });
        it("Should give the role CERTIFIER_ADMIN to the address addr2 with owner and addr1 sign (100 / 80%)", async function () {
            await contract.connect(this.addr1).grantAnyRole(await contract.CERTIFIER_ADMIN(), this.addr2.address, true);
            expect(await contract.hasRole(await contract.CERTIFIER_ADMIN(), this.addr2.address)).to.equal(true);
        });
        it("Should not give the role CERTIFIER to the address addr3 with only owner and addr1 sign (66 / 80%)", async function () {
            await contract.connect(this.owner).grantAnyRole(await contract.CERTIFIER(), this.addr3.address, true);
            await contract.connect(this.addr1).grantAnyRole(await contract.CERTIFIER(), this.addr3.address, true);
            expect(await contract.hasRole(await contract.CERTIFIER(), this.addr3.address)).to.equal(false);
        });
        it("Should not give the role CERTIFIER to the address addr3, owner second sign not counting", async function () {
            await contract.connect(this.owner).grantAnyRole(await contract.CERTIFIER(), this.addr3.address, true);
            expect(await contract.hasRole(await contract.CERTIFIER(), this.addr3.address)).to.equal(false);
        });
        it("Should give the role CERTIFIER to the address addr3 with the addr2 sign (+ owner and addr1) (100 / 80%)", async function () {
            await contract.connect(this.addr2).grantAnyRole(await contract.CERTIFIER(), this.addr3.address, true);
            expect(await contract.hasRole(await contract.CERTIFIER(), this.addr3.address)).to.equal(true);
        });
    });
    
    describe("revokeAnyRole", function () {
        it("Should revert with message 'Caller is not a CERTIFIER admin'", async function () {
            await expect(contract.connect(this.addr3).revokeAnyRole(await contract.CERTIFIER(), this.addr3.address, true)).to.be.revertedWith(/Caller is not a .* admin/);  
        });
        it("Should revert with message 'Caller is not a CERTIFIER_ADMIN admin'", async function () {
            await expect(contract.connect(this.addr3).revokeAnyRole(await contract.CERTIFIER_ADMIN(), this.addr1.address, true)).to.be.revertedWith(/Caller is not a .* admin/);
        });
        it("Should revert with message 'This address is not a CERTIFIER_ADMIN'", async function () {
            await expect(contract.connect(this.owner).revokeAnyRole(await contract.CERTIFIER_ADMIN(), this.addr3.address, true)).to.be.revertedWith(/This address is not a .*/);
        });

        it("Should not revoke the role CERTIFIER to the address addr3 with only owner and addr1 sign", async function () {
            expect(await contract.hasRole(await contract.CERTIFIER(), this.addr3.address)).to.equal(true);
            await contract.connect(this.owner).revokeAnyRole(await contract.CERTIFIER(), this.addr3.address, true);
            expect(await contract.hasRole(await contract.CERTIFIER(), this.addr3.address)).to.equal(true);
            await contract.connect(this.addr1).revokeAnyRole(await contract.CERTIFIER(), this.addr3.address, true);
            expect(await contract.hasRole(await contract.CERTIFIER(), this.addr3.address)).to.equal(true);
        });
        it("Should revoke the role CERTIFIER to the address addr3 with ", async function () {
            await contract.connect(this.addr2).revokeAnyRole(await contract.CERTIFIER(), this.addr3.address, true);
            expect(await contract.hasRole(await contract.CERTIFIER(), this.addr3.address)).to.equal(false);
        });
    });

    // HERE: owner and addr1 are CERTIFIER_ADMIN, addr2 is CERTIFIER_ADMIN and CERTIFIER
    describe("multiSig with admin removed", function () {
        it("Should not give the role CERTIFIER_ADMIN to the address addr3 with only owner and addr1 sign (66 / 80%)", async function () {
            await contract.connect(this.owner).grantAnyRole(await contract.CERTIFIER_ADMIN(), this.addr3.address, true);
            await contract.connect(this.addr1).grantAnyRole(await contract.CERTIFIER_ADMIN(), this.addr3.address, true);
            expect(await contract.hasRole(await contract.CERTIFIER_ADMIN(), this.addr3.address)).to.equal(false);
        });
        it("Should now give the role CERTIFIER_ADMIN to the address addr3, owner second sign refresh multiSig after addr2 removed from CERTIFIER_ADMIN", async function () {
            await contract.connect(this.owner).revokeAnyRole(await contract.CERTIFIER_ADMIN(), this.addr2.address, true);
            await contract.connect(this.addr1).revokeAnyRole(await contract.CERTIFIER_ADMIN(), this.addr2.address, true);
            expect(await contract.hasRole(await contract.CERTIFIER_ADMIN(), this.addr3.address)).to.equal(false);
            await contract.connect(this.owner).grantAnyRole(await contract.CERTIFIER_ADMIN(), this.addr3.address, true);
            expect(await contract.hasRole(await contract.CERTIFIER_ADMIN(), this.addr3.address)).to.equal(true);
        });
        it("Should not remove the role CERTIFIER to addr2 with owner and addr3 sign (66 / 80%) then addr3 removed from CERTIFIER_ADMIN and owner resign (50 / 80%)", async function () {
            await contract.connect(this.owner).revokeAnyRole(await contract.CERTIFIER(), this.addr2.address, true);
            await contract.connect(this.addr3).revokeAnyRole(await contract.CERTIFIER(), this.addr2.address, true);
            expect(await contract.hasRole(await contract.CERTIFIER(), this.addr2.address)).to.equal(true);
            await contract.connect(this.owner).revokeAnyRole(await contract.CERTIFIER_ADMIN(), this.addr3.address, true);
            await contract.connect(this.addr1).revokeAnyRole(await contract.CERTIFIER_ADMIN(), this.addr3.address, true);
            expect(await contract.hasRole(await contract.CERTIFIER_ADMIN(), this.addr3.address)).to.equal(false);
            await contract.connect(this.owner).revokeAnyRole(await contract.CERTIFIER(), this.addr2.address, true);
            expect(await contract.hasRole(await contract.CERTIFIER(), this.addr2.address)).to.equal(true);
        });
        it("Should remove the role CERTIFIER to addr2 with owner and addr1 sign (100 / 80%)", async function () {
            await contract.connect(this.addr1).revokeAnyRole(await contract.CERTIFIER(), this.addr2.address, true);
            expect(await contract.hasRole(await contract.CERTIFIER(), this.addr2.address)).to.equal(false);
        });
        // HERE: owner, addr1 and addr3 are CERTIFIER_ADMIN
        it("Should give then remove addr3 CERTIFIER_ADMIN role after he signed for grant CERTIFIER to addr2", async function () {
            await contract.connect(this.owner).grantAnyRole(await contract.CERTIFIER_ADMIN(), this.addr3.address, true);
            await contract.connect(this.addr1).grantAnyRole(await contract.CERTIFIER_ADMIN(), this.addr3.address, true);
            await contract.connect(this.addr3).grantAnyRole(await contract.CERTIFIER(), this.addr2.address, true);
            await contract.connect(this.owner).revokeAnyRole(await contract.CERTIFIER_ADMIN(), this.addr3.address, true);
            await contract.connect(this.addr1).revokeAnyRole(await contract.CERTIFIER_ADMIN(), this.addr3.address, true);
            expect(await contract.hasRole(await contract.CERTIFIER_ADMIN(), this.addr3.address)).to.equal(false);
        });
        it("Should grant addr3 CERTIFIER_ADMIN and addr3 sign to grant CERTIFIER to addr2 work", async function () {
            await contract.connect(this.owner).grantAnyRole(await contract.CERTIFIER_ADMIN(), this.addr3.address, true);
            await contract.connect(this.addr1).grantAnyRole(await contract.CERTIFIER_ADMIN(), this.addr3.address, true);
            await contract.connect(this.owner).grantAnyRole(await contract.CERTIFIER(), this.addr2.address, true);
            await contract.connect(this.addr1).grantAnyRole(await contract.CERTIFIER(), this.addr2.address, true);
            expect(await contract.hasRole(await contract.CERTIFIER(), this.addr2.address)).to.equal(false);
            await contract.connect(this.addr3).grantAnyRole(await contract.CERTIFIER(), this.addr2.address, true);
            expect(await contract.hasRole(await contract.CERTIFIER(), this.addr2.address)).to.equal(true);
        });
        // HERE: owner, addr1 and addr3 are CERTIFIER_ADMIN, addr2 is CERTIFIER
    });
    describe("multiSig with admin removed (grantAny)", function () {
        it("Should not count the owner sign after he removed from grant CERTIFIER to addr3", async function () {
            await contract.connect(this.owner).grantAnyRole(await contract.CERTIFIER(), this.addr3.address, true);
            await contract.connect(this.addr1).grantAnyRole(await contract.CERTIFIER(), this.addr3.address, true);
            await contract.connect(this.owner).grantAnyRole(await contract.CERTIFIER(), this.addr3.address, false);
            await contract.connect(this.addr3).grantAnyRole(await contract.CERTIFIER(), this.addr3.address, true);
            expect(await contract.hasRole(await contract.CERTIFIER(), this.addr3.address)).to.equal(false);
            await contract.connect(this.owner).grantAnyRole(await contract.CERTIFIER(), this.addr3.address, true);
            expect(await contract.hasRole(await contract.CERTIFIER(), this.addr3.address)).to.equal(true);
            await contract.connect(this.owner).revokeAnyRole(await contract.CERTIFIER(), this.addr3.address, true);
            await contract.connect(this.addr1).revokeAnyRole(await contract.CERTIFIER(), this.addr3.address, true);
            await contract.connect(this.addr3).revokeAnyRole(await contract.CERTIFIER(), this.addr3.address, true);
        });
    });
    describe("Remove Sign", function () {
        it("Should not revoke addr2 to CERTIFIER with owner sign, addr1 sign, owner unsign, addr3 sign (66 / 80%)", async function () {
            contract.connect(this.owner).revokeAnyRole(await contract.CERTIFIER(), this.addr2.address, true);
            contract.connect(this.addr1).revokeAnyRole(await contract.CERTIFIER(), this.addr2.address, true);
            expect(await contract.hasRole(await contract.CERTIFIER(), this.addr2.address)).to.equal(true);
            contract.connect(this.owner).revokeAnyRole(await contract.CERTIFIER(), this.addr2.address, false);
            contract.connect(this.addr3).revokeAnyRole(await contract.CERTIFIER(), this.addr2.address, true);
            expect(await contract.hasRole(await contract.CERTIFIER(), this.addr2.address)).to.equal(true);
            contract.connect(this.addr1).revokeAnyRole(await contract.CERTIFIER(), this.addr2.address, false);
            contract.connect(this.addr3).revokeAnyRole(await contract.CERTIFIER(), this.addr2.address, false);
        });
        it("Should be reverted with message 'You have note signed this multisig yet", async function () {
            await expect(contract.connect(this.owner).revokeAnyRole(await contract.CERTIFIER(), this.addr2.address, false)).to.be.revertedWith(/You have note signed this multisig yet/);
        });
    });

    describe("Certify", function () {
        it("Should create a certification", async function () {
            await expect(contract.connect(this.addr2).certify(105, "George", "Pedro", 1683812617, 1, 2, 1)).to.emit(contract, "certificationEmited").withArgs(105, 1, 2, 1);
            expect((await contract.certificates(ethers.utils.solidityKeccak256(["uint", "uint8", "uint8", "uint8"], [105,1,2,1]))).id).to.deep.equal(105);
            expect((await contract.certificates(ethers.utils.solidityKeccak256(["uint", "uint8", "uint8", "uint8"], [105,1,2,1]))).appreciation).to.deep.equal(1);
            expect((await contract.certificates(ethers.utils.solidityKeccak256(["uint", "uint8", "uint8", "uint8"], [105,1,2,1]))).degree).to.deep.equal(2);
            expect((await contract.certificates(ethers.utils.solidityKeccak256(["uint", "uint8", "uint8", "uint8"], [105,1,2,1]))).program).to.deep.equal(1);
        });
        it("Should revert with message 'Caller is not a certifier'", async function () {
            await expect(contract.connect(this.owner).certify(106, "George", "Pedro", 1683812617, 1, 2, 1)).to.be.revertedWith(/Caller is not a certifier/);
        });
        it("Should revert with message 'This certification already exists'", async function () {
            await expect(contract.connect(this.addr2).certify(105, "George", "Pedro", 1683812617, 1, 2, 1)).to.be.revertedWith(/This certificate already exists/);
        });
    });

});
