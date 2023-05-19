import { expect } from "chai";
import { ethers } from "hardhat";
import { Maths } from "../typechain-types/contracts/utils/Maths";

describe("Maths", function () {
    let contract : Maths;

    before(async function () {
        [this.owner, this.addr1, this.addr2, ...this.addrs] = await ethers.getSigners();
        const Maths = await ethers.getContractFactory("Maths");
        contract = await Maths.deploy();
    });

    describe("ceilUDiv", function () {
        it("Should get 0 / 1 = 0", async function () {
            expect(await contract.ceilUDiv(0, 1)).to.equal(0);
        });
        it("Should get 1 / 1 = 1", async function () {
            expect(await contract.ceilUDiv(1, 1)).to.equal(1);
        });
        it("Should get 1 / 2 = 1", async function () {
            expect(await contract.ceilUDiv(1, 2)).to.equal(1);
        });
        it("Should get 6 / 5 = 2", async function () {
            expect(await contract.ceilUDiv(6, 5)).to.equal(2);
        });
    });
});
