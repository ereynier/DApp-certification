// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./utils/Maths.sol";
import "./utils/MultiSigWithRole.sol";

contract Certifications is AccessControl, MultiSigWithRole, Maths {

    event multiSigSigned(bytes32 multiSigName);
    event multiSigCleared(bytes32 multiSigName);
    event certificationEmited(uint studentId, appreciation appreciation, degree degree, program program);

    struct Role {
        uint32 nb;
        uint32 MIN;
        uint32 MAX;
        uint8 PERCENT_TO_GRANT;
        uint8 PERCENT_TO_REVOKE;
        bytes32 ADMIN;
        bytes32 name;
    }

    enum appreciation {
        A,
        B,
        C,
        D
    }

    enum degree {
        BACHELOR,
        MASTER,
        PHD
    }

    enum program {
        COMPUTER_SCIENCE,
        MATHEMATICS,
        PHYSICS,
        CHEMISTRY,
        BIOLOGY,
        ECONOMICS,
        LAW,
        MEDICINE,
        PHILOSOPHY,
        LITERATURE,
        HISTORY,
        GEOGRAPHY,
        ARTS,
        MUSIC,
        SPORTS,
        OTHER
    }


    struct Certificate {
        appreciation appreciation;
        degree degree;
        program program;
        uint emition_date;
        bool validity;

        // STUDENT INFO
        uint id;
        bytes32 firstname;
        bytes32 lastname;
        uint birthdate;
    }

    bytes32 public constant CERTIFIER = keccak256("CERTIFIER");
    bytes32 public constant CERTIFIER_ADMIN = keccak256("CERTIFIER_ADMIN");


    uint8 public constant MAX_CERTIFIERS = 15;

    uint8 public constant MIN_CERTIFIERS_ADMIN = 2;
    uint8 public constant MAX_CERTIFIERS_ADMIN = 15;

    uint8 public constant PERCENT_TO_GRANT_CERTIFIER_ADMIN = 80;
    uint8 public constant PERCENT_TO_REVOKE_CERTIFIER_ADMIN = 80;

    uint8 public constant PERCENT_TO_GRANT_CERTIFIER = 80;
    uint8 public constant PERCENT_TO_REVOKE_CERTIFIER = 80;

    uint8 public constant PERCENT_TO_CERTIFY = 51;
    uint8 public constant PERCENT_TO_EDIT_CERTIFICATE = 80;

    
    mapping (bytes32 => Role) internal roles;

    mapping (bytes32 => MultiSigRole) public multiSig;

    mapping (uint => bytes32) public multiSigId;

    uint multiSigIdCount;

    mapping (bytes32 => Certificate) public certificates;


    constructor(address certifier_admin1, address certifier_admin2) {
        require(certifier_admin1 != address(0), "Certifier admin1 address cannot be 0");
        require(certifier_admin2 != address(0), "Certifier admin2 address cannot be 0");
        require(certifier_admin1 != certifier_admin2, "Certifier addresses cannot be the same");

        _setupRole(CERTIFIER_ADMIN, certifier_admin1);
        _grantRole(CERTIFIER_ADMIN, certifier_admin2);
        roles[CERTIFIER_ADMIN] = Role(
            2, 
            MIN_CERTIFIERS_ADMIN, 
            MAX_CERTIFIERS_ADMIN, 
            PERCENT_TO_GRANT_CERTIFIER_ADMIN,
            PERCENT_TO_REVOKE_CERTIFIER_ADMIN,
            CERTIFIER_ADMIN,
            bytes32(abi.encodePacked("CERTIFIER_ADMIN"))
        );

        _setupRole(CERTIFIER, address(0));
        roles[CERTIFIER] = Role(
            0,
            0,
            MAX_CERTIFIERS,
            PERCENT_TO_GRANT_CERTIFIER,
            PERCENT_TO_REVOKE_CERTIFIER,
            CERTIFIER_ADMIN,
            bytes32(abi.encodePacked("CERTIFIER"))
        );
    }

    function multiSigIdentifier(bytes32 multiSigName, bytes32 role, string memory info) internal {
        if (multiSig[multiSigName].created == false) {
            multiSig[multiSigName].created = true;
            multiSigId[multiSigIdCount] = multiSigName;
            multiSigIdCount += 1;
            multiSig[multiSigName].role = role;
            multiSig[multiSigName].info = info;
        }
    }

    function grantAnyRole(bytes32 roleHash, address target, bool sign) external {
        Role storage role = roles[roleHash];
        require(role.MAX > role.nb, string.concat("Max ", string(abi.encodePacked(role.name)), " reached"));
        require(hasRole(role.ADMIN, msg.sender), string.concat("Caller is not a ", string(abi.encodePacked(role.name)), " admin"));
        require(hasRole(roleHash, target) == false, string.concat("This address is already a ", string(abi.encodePacked(role.name))));

        bytes32 multiSigName = keccak256(abi.encodePacked(target, "GRANT", roleHash));
        multiSigIdentifier(multiSigName, role.ADMIN, string.concat("Grant ", string(abi.encodePacked(role.name)), " ", string(abi.encodePacked(target))));

        if (sign && multiSig[multiSigName].approved[msg.sender] == false) {
            multiSigRoleSign(multiSig[multiSigName], msg.sender);
            emit multiSigSigned(multiSigName);
        } else if (sign == false) {
            multiSigRoleUnsign(multiSig[multiSigName], msg.sender);
            emit multiSigSigned(multiSigName);
        }

        if (multiSig[multiSigName].count >= (ceilUDiv(roles[role.ADMIN].nb * role.PERCENT_TO_GRANT, 100))) {
            clearMultiSigRole(multiSig[multiSigName]);
            emit multiSigCleared(multiSigName);
            _grantRole(roleHash, target);
            role.nb += 1;
        }
    }

    function revokeAnyRole(bytes32 roleHash, address target, bool sign) external {
        Role storage role = roles[roleHash];
        require(role.nb > role.MIN, string.concat("Min ", string(abi.encodePacked(role.name)), " reached"));
        require(hasRole(roleHash, target), string.concat("This address is not a ", string(abi.encodePacked(role.name))));
        require(hasRole(role.ADMIN, msg.sender), string.concat("Caller is not a ", string(abi.encodePacked(role.name)), " admin"));

        bytes32 multiSigName = keccak256(abi.encodePacked(target, "REVOKE", roleHash));
        multiSigIdentifier(multiSigName, role.ADMIN, string.concat("Revoke ", string(abi.encodePacked(role.name)), " ", string(abi.encodePacked(target))));

        if (sign && multiSig[multiSigName].approved[msg.sender] == false) {
            multiSigRoleSign(multiSig[multiSigName], msg.sender);
            emit multiSigSigned(multiSigName);
        } else if (sign == false) {
            multiSigRoleUnsign(multiSig[multiSigName], msg.sender);
            emit multiSigSigned(multiSigName);
        }

        if ((roleHash != role.ADMIN && multiSig[multiSigName].count >= (ceilUDiv(roles[role.ADMIN].nb * role.PERCENT_TO_REVOKE, 100))) ||
            (roleHash == role.ADMIN && multiSig[multiSigName].count >= (ceilUDiv((roles[role.ADMIN].nb - 1) * role.PERCENT_TO_REVOKE, 100))))
        {

            for (uint i = 0; i < multiSigIdCount; i++) {
                if (multiSig[multiSigId[i]].approved[target] == true && multiSig[multiSigId[i]].role == roleHash) {
                    multiSig[multiSigId[i]].count -= 1;
                    multiSig[multiSigId[i]].approved[target] = false;
                }
            }
            
            clearMultiSigRole(multiSig[multiSigName]);
            emit multiSigCleared(multiSigName);
            _revokeRole(roleHash, target);
            role.nb -= 1;
        }
    }

    function createCertificate(uint studentId, bytes32 studentFirstname, bytes32 studentLastname, uint studentBirthdate, appreciation app, degree deg, program prog) internal {
        certificates[keccak256(abi.encodePacked(studentId, app, deg, prog))] = Certificate(
            app,
            deg,
            prog,
            block.timestamp,
            true,
            studentId,
            studentFirstname,
            studentLastname,
            studentBirthdate
        );
        emit certificationEmited(studentId, app, deg, prog);
    }

    function certify(uint studentId, string memory studentFirstname, string memory studentLastname, uint studentBirthdate, appreciation app, degree deg, program prog) external {
        require(hasRole(CERTIFIER, msg.sender), "Caller is not a certifier");
        require(app >= appreciation.A && app <= appreciation.D, "Appreciation is not valid");
        require(deg >= degree.BACHELOR && deg <= degree.PHD, "Degree is not valid");
        require(prog >= program.COMPUTER_SCIENCE && prog <= program.OTHER, "Program is not valid");
        require(certificates[keccak256(abi.encodePacked(studentId, app, deg, prog))].validity == false, "This certificate already exists");

        bytes32 multiSigName = keccak256(abi.encodePacked(studentId, "CERTIFY", app, deg, prog));
        multiSigIdentifier(multiSigName, CERTIFIER, string.concat("Certify ", string(abi.encodePacked(studentId)), " ", string(abi.encodePacked(app)), " ", string(abi.encodePacked(deg)), " ", string(abi.encodePacked(prog))));

        if (multiSig[multiSigName].approved[msg.sender] == false) {
            multiSigRoleSign(multiSig[multiSigName], msg.sender);
            emit multiSigSigned(multiSigName);
        }

        if (multiSig[multiSigName].count >= (ceilUDiv(roles[CERTIFIER].nb * PERCENT_TO_CERTIFY, 100))) {
            clearMultiSigRole(multiSig[multiSigName]);
            emit multiSigCleared(multiSigName);
            createCertificate(studentId, bytes32(abi.encodePacked(studentFirstname)), bytes32(abi.encodePacked(studentLastname)), studentBirthdate, app, deg, prog);
        }
    }

    function renounceRole(bytes32, address) public virtual override {
        revert("You can't renounce to your role. Please contact admins");
    }
}