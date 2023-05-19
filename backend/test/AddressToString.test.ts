import { expect } from "chai";
import { ethers } from "hardhat";
import { AddressToString } from "../typechain-types/contracts/utils/AddressToString";

describe("AddressToString", function () {
    let contract : AddressToString;

    before(async function () {
        [this.owner, this.addr1, this.addr2, ...this.addrs] = await ethers.getSigners();
        const AddressToString = await ethers.getContractFactory("AddressToString");
        contract = await AddressToString.deploy();
    });

    describe("addToStr", function () {
        it("Should get the owner.addr", async function () {
            const str = await contract.addToStr(this.owner.address)
            console.log(typeof str);
            expect(str).to.equal(String(this.owner.address).toLocaleLowerCase());
        });
    });
});
