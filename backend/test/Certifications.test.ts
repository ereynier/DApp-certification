import { expect } from "chai";
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

    describe("createStudents", function () {
        it("Should revert with message 'Caller is not a certifier'", async function () {
            await expect(contract.connect(this.owner).createStudent(105, "Petro", "Maximov", 115400)).to.be.revertedWith(/Caller is not a certifier/);
        });
        it("Should revert with message 'Id must be greater than 0'", async function () {
            await expect(contract.connect(this.addr2).createStudent(0, "Petro", "Maximov", 115400)).to.be.revertedWith(/Id must be greater than 0/);
        });
        it("Should revert with message 'Firstname cannot be empty'", async function () {
            await expect(contract.connect(this.addr2).createStudent(105, "", "Maximov", 115400)).to.be.revertedWith(/Firstname cannot be empty/);
        });
        it("Should revert with message 'Lastname cannot be empty'", async function () {
            await expect(contract.connect(this.addr2).createStudent(105, "Petro", "", 115400)).to.be.revertedWith(/Lastname cannot be empty/);
        });
        it("Should revert with message 'Birthdate must be greater than 0'", async function () {
            await expect(contract.connect(this.addr2).createStudent(105, "Petro", "Maximov", 0)).to.be.revertedWith(/Birthdate must be greater than 0/);
        });
        it("Should create a student", async function () {
            await expect(contract.connect(this.addr2).createStudent(105, "Petro", "Maximov", 115400)).to.emit(contract, "StudentAdded").withArgs(105, "Petro", "Maximov", 115400);
            expect((await contract.students(105)).id).to.deep.equal(105);
            expect((await contract.students(105)).firstname).to.deep.equal("Petro");
            expect((await contract.students(105)).lastname).to.deep.equal("Maximov");
            expect((await contract.students(105)).birthdate).to.deep.equal(115400);
        });
        it("Should revert with message 'This student already exists'", async function () {
            await expect(contract.connect(this.addr2).createStudent(105, "Petro", "Maximov", 115400)).to.be.revertedWith(/This student already exists/);
        });
        it("Should create a student if only one CERTIFIER sign", async function () {
            await contract.connect(this.owner).grantAnyRole(await contract.CERTIFIER(), this.addr3.address, true);
            await contract.connect(this.addr1).grantAnyRole(await contract.CERTIFIER(), this.addr3.address, true);
            await contract.connect(this.addr3).grantAnyRole(await contract.CERTIFIER(), this.addr3.address, true);
            expect(await contract.hasRole(await contract.CERTIFIER(), this.addr3.address)).to.equal(true);
            await contract.connect(this.addr2).createStudent(106, "Lea", "Capuccino", 1164024);
            expect((await contract.students(106)).id).to.deep.equal(106);
        });
    });

    describe("removeStudentById", function () {
        it("Should revert with message 'Caller is not a certifier'", async function () {
            await expect(contract.connect(this.owner).removeStudentById(105, true)).to.be.revertedWith(/Caller is not a certifier/);
        });
        it("Should revert with message 'This student does not exist'", async function () {
            await expect(contract.connect(this.addr2).removeStudentById(107, true)).to.be.revertedWith(/This student doesn't exist/);
        });
        it("Should revert with message 'Id must be greater than 0'", async function () {
            await expect(contract.connect(this.addr2).removeStudentById(0, true)).to.be.revertedWith(/Id must be greater than 0/);
        });
        it("Should not remove the student if only addr2 sign (50 / 80%)", async function () {
            await contract.connect(this.addr2).removeStudentById(105, true);
            expect((await contract.students(105)).id).to.deep.equal(105);
        });
        it("Should not remove the student if addr2 unsign and addr3 sign (50 / 80%)", async function () {
            await contract.connect(this.addr2).removeStudentById(105, false);
            await contract.connect(this.addr3).removeStudentById(105, true);
            expect((await contract.students(105)).id).to.deep.equal(105);
        });
        it("Should remove the student if addr2 sign and addr3 sign (100 / 80%)", async function () {
            await expect(contract.connect(this.addr2).removeStudentById(105, true)).to.emit(contract, "StudentDeleted").withArgs(105);
            expect((await contract.students(105)).id).to.deep.equal(0);
        });
        it("Should create a student with id previously deleted", async function () {
            await expect(contract.connect(this.addr2).createStudent(105, "Wanda", "Maximov", 115401)).to.emit(contract, "StudentAdded").withArgs(105, "Wanda", "Maximov", 115401);
            expect((await contract.students(105)).id).to.deep.equal(105);
            expect((await contract.students(105)).firstname).to.deep.equal("Wanda");
            expect((await contract.students(105)).lastname).to.deep.equal("Maximov");
            expect((await contract.students(105)).birthdate).to.deep.equal(115401);
        });
        it("Should create the same student with the same ID after deleting it", async function () {
            await contract.connect(this.addr2).createStudent(110, "Jordan", "Leblond", 11640244);
            await contract.connect(this.addr2).removeStudentById(110, true);
            await contract.connect(this.addr3).removeStudentById(110, true);
            await contract.connect(this.addr2).createStudent(110, "Jordan", "Leblond", 11640244);
            expect((await contract.students(110)).id).to.deep.equal(110);
            expect((await contract.students(110)).firstname).to.deep.equal("Jordan");
            expect((await contract.students(110)).lastname).to.deep.equal("Leblond");
            expect((await contract.students(110)).birthdate).to.deep.equal(11640244);
        });
    });

    describe("editStudentById", function () {
        it("Should revert with message 'Caller is not a certifier'", async function () {
            await expect(contract.connect(this.owner).editStudentById(106, "Lea", "Capuccino", 1164024)).to.be.revertedWith(/Caller is not a certifier/);
        });
        it("Should revert with message 'This student does not exist'", async function () {
            await expect(contract.connect(this.addr2).editStudentById(107, "Lea", "Capuccino", 1164024)).to.be.revertedWith(/This student doesn't exist/);
        });
        it("Should revert with message 'Id must be greater than 0'", async function () {
            await expect(contract.connect(this.addr2).editStudentById(0, "Lea", "Capuccino", 1164024)).to.be.revertedWith(/Id must be greater than 0/);
        });
        it("Should edit the student if only addr2 sign", async function () {
            await expect(contract.connect(this.addr2).editStudentById(106, "Leo", "Expresso", 11458)).to.emit(contract, "StudentEdited").withArgs(106, "Leo", "Expresso", 11458);
            expect((await contract.students(106)).id).to.deep.equal(106);
            expect((await contract.students(106)).firstname).to.deep.equal("Leo");
            expect((await contract.students(106)).lastname).to.deep.equal("Expresso");
            expect((await contract.students(106)).birthdate).to.deep.equal(11458);
        });
        it("Should edit the student with only firstname provided", async function () {
            await contract.connect(this.addr2).editStudentById(106, "Rodrigo", "", 0);
            expect((await contract.students(106)).id).to.deep.equal(106);
            expect((await contract.students(106)).firstname).to.deep.equal("Rodrigo");
            expect((await contract.students(106)).lastname).to.deep.equal("Expresso");
            expect((await contract.students(106)).birthdate).to.deep.equal(11458);
        });
        it("Should edit the student with only lastname provided", async function () {
            await contract.connect(this.addr2).editStudentById(106, "", "Cortez", 0);
            expect((await contract.students(106)).id).to.deep.equal(106);
            expect((await contract.students(106)).firstname).to.deep.equal("Rodrigo");
            expect((await contract.students(106)).lastname).to.deep.equal("Cortez");
            expect((await contract.students(106)).birthdate).to.deep.equal(11458);
        });
        it("Should edit the student with only birthdate provided", async function () {
            await contract.connect(this.addr2).editStudentById(106, "", "", 157);
            expect((await contract.students(106)).id).to.deep.equal(106);
            expect((await contract.students(106)).firstname).to.deep.equal("Rodrigo");
            expect((await contract.students(106)).lastname).to.deep.equal("Cortez");
            expect((await contract.students(106)).birthdate).to.deep.equal(157);
        });
        it("Should edit the student with only firstname and lastname provided", async function () {
            await contract.connect(this.addr2).editStudentById(106, "Leo", "Expresso", 0);
            expect((await contract.students(106)).id).to.deep.equal(106);
            expect((await contract.students(106)).firstname).to.deep.equal("Leo");
            expect((await contract.students(106)).lastname).to.deep.equal("Expresso");
            expect((await contract.students(106)).birthdate).to.deep.equal(157);
        });
    });

    describe("getStudent", function () {
        it("Should revert with message 'Student does not exist'", async function () {
            await expect(contract.connect(this.addr2).getStudent(107)).to.be.revertedWith(/Student doesn't exist/);
        });
        it("Should get the student", async function () {
            expect(await contract.connect(this.addr2).getStudent(106)).to.deep.equal([106, "Leo", "Expresso", 157]);
        });
    });


    describe("Certify", function () {
        it("Should revert with message 'Caller is not a certifier'", async function () {
            await expect(contract.connect(this.owner).certify(106, 1, 2, 1, true)).to.be.revertedWith(/Caller is not a certifier/);
        });
        it("Should revert with message 'This student doesn't exist'", async function () {
            await expect(contract.connect(this.addr2).certify(107, 1, 2, 1, true)).to.be.revertedWith(/This student doesn't exist/);
        });
        it("Should create a certification", async function () {
            //removing addr3 from CERTIFIER
            await contract.connect(this.owner).revokeAnyRole(await contract.CERTIFIER(), this.addr3.address, true);
            await contract.connect(this.addr1).revokeAnyRole(await contract.CERTIFIER(), this.addr3.address, true);
            await contract.connect(this.addr3).revokeAnyRole(await contract.CERTIFIER(), this.addr3.address, true);
            ///////////////////////////////
            await expect(contract.connect(this.addr2).certify(105, 1, 2, 1, true)).to.emit(contract, "certificationEmited").withArgs(105, 1, 2, 1);
            expect((await contract.certificates(ethers.utils.solidityKeccak256(["uint", "uint8", "uint8", "uint8"], [105,1,2,1]))).stud_id).to.deep.equal(105);
            expect((await contract.certificates(ethers.utils.solidityKeccak256(["uint", "uint8", "uint8", "uint8"], [105,1,2,1]))).appreciation).to.deep.equal(1);
            expect((await contract.certificates(ethers.utils.solidityKeccak256(["uint", "uint8", "uint8", "uint8"], [105,1,2,1]))).degree).to.deep.equal(2);
            expect((await contract.certificates(ethers.utils.solidityKeccak256(["uint", "uint8", "uint8", "uint8"], [105,1,2,1]))).program).to.deep.equal(1);
        });
        it("Should revert with message 'This certification already exists'", async function () {
            await expect(contract.connect(this.addr2).certify(105, 1, 2, 1, true)).to.be.revertedWith(/This certificate already exists/);
        });
        it("Should not approve the certification with addr2 remove his sign and addr3 sign (50 / 51%)", async function () {
            await contract.connect(this.owner).grantAnyRole(await contract.CERTIFIER(), this.addr3.address, true);
            await contract.connect(this.addr1).grantAnyRole(await contract.CERTIFIER(), this.addr3.address, true);
            await contract.connect(this.addr3).grantAnyRole(await contract.CERTIFIER(), this.addr3.address, true);
            expect(await contract.hasRole(await contract.CERTIFIER(), this.addr3.address)).to.equal(true);
            await contract.connect(this.addr2).certify(106, 3, 2, 1, true);
            expect((await contract.certificates(ethers.utils.solidityKeccak256(["uint", "uint8", "uint8", "uint8"], [106,3,2,1]))).stud_id).to.deep.equal(0);
            await contract.connect(this.addr2).certify(106, 3, 2, 1, false);
            await contract.connect(this.addr3).certify(106, 3, 2, 1, true);
            expect((await contract.certificates(ethers.utils.solidityKeccak256(["uint", "uint8", "uint8", "uint8"], [106,3,2,1]))).stud_id).to.deep.equal(0);
        });
        it("Should approve the certification with addr2 sign and addr3 sign (100 / 51%)", async function () {
            await contract.connect(this.addr2).certify(106, 3, 2, 1, true);
            expect((await contract.certificates(ethers.utils.solidityKeccak256(["uint", "uint8", "uint8", "uint8"], [106,3,2,1]))).stud_id).to.deep.equal(106);
        });
    });
    describe("Delete certificate", function () {
        it("Should revert with message 'Caller is not a certifier'", async function () {
            await expect(contract.connect(this.owner).deleteCertificate(106, 3, 2, 1, true)).to.be.revertedWith(/Caller is not a certifier/);
        });
        it("Should revert with message 'This student doesn't exist'", async function () {
            await expect(contract.connect(this.addr2).deleteCertificate(107, 1, 2, 1, true)).to.be.revertedWith(/This student doesn't exist/);
        });
        it("Should revert with message 'This certification does not exist'", async function () {
            await expect(contract.connect(this.addr2).deleteCertificate(106, 1, 2, 1, true)).to.be.revertedWith(/This certificate doesn't exist/);
            await expect(contract.connect(this.addr2).deleteCertificate(106, 0, 2, 1, true)).to.be.revertedWith(/This certificate doesn't exist/);
            await expect(contract.connect(this.addr2).deleteCertificate(106, 3, 0, 1, true)).to.be.revertedWith(/This certificate doesn't exist/);
            await expect(contract.connect(this.addr2).deleteCertificate(106, 3, 2, 5, true)).to.be.revertedWith(/This certificate doesn't exist/);
        });
        it("Should revert", async function () {
            await expect(contract.connect(this.addr2).deleteCertificate(106, 5, 2, 1, true)).to.be.reverted;
            await expect(contract.connect(this.addr2).deleteCertificate(106, 3, 50, 1, true)).to.be.reverted;
            await expect(contract.connect(this.addr2).deleteCertificate(106, 3, 2, 100, true)).to.be.reverted;
        });
        
        it("Should delete the certification", async function () {
            await contract.connect(this.addr2).deleteCertificate(106, 3, 2, 1, true);
            expect((await contract.certificates(ethers.utils.solidityKeccak256(["uint", "uint8", "uint8", "uint8"], [106,3,2,1]))).validity).to.deep.equal(true);
            await contract.connect(this.addr3).deleteCertificate(106, 3, 2, 1, true);
            expect((await contract.certificates(ethers.utils.solidityKeccak256(["uint", "uint8", "uint8", "uint8"], [106,3,2,1]))).stud_id).to.deep.equal(106);
            expect((await contract.certificates(ethers.utils.solidityKeccak256(["uint", "uint8", "uint8", "uint8"], [106,3,2,1]))).validity).to.deep.equal(false);
        });
        it("Should not delete the certification with addr2 remove his sign and addr3 sign (50 / 51%)", async function () {
            await contract.connect(this.addr2).certify(110, 0, 0, 1, true);
            await contract.connect(this.addr3).certify(110, 0, 0, 1, true);
            expect((await contract.certificates(ethers.utils.solidityKeccak256(["uint", "uint8", "uint8", "uint8"], [110,0,0,1]))).stud_id).to.deep.equal(110);
            expect((await contract.certificates(ethers.utils.solidityKeccak256(["uint", "uint8", "uint8", "uint8"], [110,0,0,1]))).validity).to.deep.equal(true);
            await contract.connect(this.addr2).deleteCertificate(110, 0, 0, 1, true);
            expect((await contract.certificates(ethers.utils.solidityKeccak256(["uint", "uint8", "uint8", "uint8"], [110,0,0,1]))).validity).to.deep.equal(true);
            await contract.connect(this.addr2).deleteCertificate(110, 0, 0, 1, false);
            await contract.connect(this.addr3).deleteCertificate(110, 0, 0, 1, true);
            expect((await contract.certificates(ethers.utils.solidityKeccak256(["uint", "uint8", "uint8", "uint8"], [110,0,0,1]))).validity).to.deep.equal(true);
            await contract.connect(this.addr3).deleteCertificate(110, 0, 0, 1, false);
        });
        it("Should recreate the certificate that was deleted", async function () {
            expect((await contract.certificates(ethers.utils.solidityKeccak256(["uint", "uint8", "uint8", "uint8"], [106,3,2,1]))).validity).to.deep.equal(false);
            await contract.connect(this.addr2).certify(106, 3, 2, 1, true);
            await contract.connect(this.addr3).certify(106, 3, 2, 1, true);
            expect((await contract.certificates(ethers.utils.solidityKeccak256(["uint", "uint8", "uint8", "uint8"], [106,3,2,1]))).validity).to.deep.equal(true);
        });
    });

    describe("getCertificatesByStudent", function () {
        it("Should revert with message 'This student doesn't exist'", async function () {
            await expect(contract.connect(this.addr2).getCertificatesByStudent(107)).to.be.revertedWith(/This student doesn't exist/);
        });
        it("Should get the student's certifications", async function () {
            expect(await contract.connect(this.addr2).getCertificatesByStudent(110)).to.deep.equal([ethers.utils.solidityKeccak256(["uint", "uint8", "uint8", "uint8"], [110,0,0,1])]);
        });
        it("Should get the student's certifications", async function () {
            await contract.connect(this.addr2).certify(106, 3, 0, 1, true);
            await contract.connect(this.addr3).certify(106, 3, 0, 1, true);
            let certificates = [...new Set(await contract.connect(this.addr2).getCertificatesByStudent(106))];
            expect(certificates).to.deep.equal([ethers.utils.solidityKeccak256(["uint", "uint8", "uint8", "uint8"], [106,3,2,1]), ethers.utils.solidityKeccak256(["uint", "uint8", "uint8", "uint8"], [106,3,0,1])]);
        });
    });
});
