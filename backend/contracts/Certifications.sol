// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./utils/maths.sol";

contract Certifications is AccessControl, Maths {

    struct Role {
        uint32 nb;
        uint32 MIN;
        uint32 MAX;
        uint8 PERCENT_TO_GRANT;
        bytes32 ADMIN;
        bytes32 name;
    }

    struct MultiSig {
        bool created;
        bytes32 role;
        uint8 count;
        uint8 id;
        mapping (address => bool) approved;
        mapping (uint => address) address_id;
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

    uint8 public constant PERCENT_TO_CERTIFY = 50;
    uint8 public constant PERCENT_TO_EDIT_CERTIFICATE = 80;

    
    mapping (bytes32 => Role) internal roles;

    
    uint8 public certifier_nb = 0;
    uint8 public certifier_admin_nb = 0;

    mapping (bytes32 => MultiSig) internal multiSig;

    mapping (uint => bytes32) internal multiSigId;

    uint multiSigIdCount;


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
            CERTIFIER_ADMIN,
            bytes32(abi.encodePacked("CERTIFIER_ADMIN"))
        );

        _setupRole(CERTIFIER, address(0));
        roles[CERTIFIER] = Role(
            0,
            0,
            MAX_CERTIFIERS,
            PERCENT_TO_GRANT_CERTIFIER,
            CERTIFIER_ADMIN,
            bytes32(abi.encodePacked("CERTIFIER"))
        );
    }

    function multiSigIdentifier(bytes32 multiSigName, bytes32 role) internal {
        if (multiSig[multiSigName].created == false) {
            multiSig[multiSigName].created = true;
            multiSigId[multiSigIdCount] = multiSigName;
            multiSigIdCount += 1;
            multiSig[multiSigName].role = role;
        }
    }

    function grantAnyRole(bytes32 roleHash, address target) external {
        Role storage role = roles[roleHash];
        require(role.MAX > role.nb, string.concat("Max ", string(abi.encodePacked(role.name)), " reached"));
        require(hasRole(role.ADMIN, msg.sender), "Caller is not a role admin");

        bytes32 certifierHash = keccak256(abi.encodePacked(target, "GRANT", roleHash));
        multiSigIdentifier(certifierHash, role.ADMIN);

        require(multiSig[certifierHash].approved[msg.sender] == false, "Role already approved");
        multiSig[certifierHash].address_id[multiSig[certifierHash].id] = msg.sender;
        multiSig[certifierHash].id++;
        multiSig[certifierHash].approved[msg.sender] = true;
        multiSig[certifierHash].count += 1;

        if (multiSig[certifierHash].count >= (roles[role.ADMIN].nb * ceilUDiv(role.PERCENT_TO_GRANT, 100))) {
            multiSig[certifierHash].count = 0;
            for (uint8 i = 0; i < multiSig[certifierHash].id; i++) {
                multiSig[certifierHash].approved[multiSig[certifierHash].address_id[i]] = false;
            }
            _grantRole(roleHash, target);
            role.nb += 1;
        }
    }

    function grantCertifier(address target) external {
        require(MAX_CERTIFIERS > certifier_nb, "Max certifiers reached");
        require(hasRole(CERTIFIER_ADMIN, msg.sender), "Caller is not a certifier admin");

        bytes32 certifierHash = keccak256(abi.encodePacked(target, "GRANT_CERTIFIER"));
        multiSigIdentifier(certifierHash);
        
        require(multiSig[certifierHash].approved[msg.sender] == false, "Certifier already approved");
        multiSig[certifierHash].address_id[multiSig[certifierHash].id] = msg.sender;
        multiSig[certifierHash].id++;
        multiSig[certifierHash].approved[msg.sender] = true;
        multiSig[certifierHash].count += 1;
        if (multiSig[certifierHash].count >= (certifier_admin_nb * PERCENT_TO_GRANT_CERTIFIER / 100)) {
            multiSig[certifierHash].count = 0;
            for (uint8 i = 0; i < multiSig[certifierHash].id; i++) {
                multiSig[certifierHash].approved[multiSig[certifierHash].address_id[i]] = false;
            }
            _grantRole(CERTIFIER, target);
            certifier_nb += 1;
        }
    }

    function revokeCertifier(address target) external {
        require(hasRole(CERTIFIER_ADMIN, msg.sender), "Caller is not a certifier admin");
        require(hasRole(CERTIFIER, target), "This address is not a certifier");

        bytes32 certifierHash = keccak256(abi.encodePacked(target, "REVOKE_CERTIFIER"));
        multiSigIdentifier(certifierHash);
        
        require(multiSig[certifierHash].approved[msg.sender] == false, "Certifier revokation already approved");
        multiSig[certifierHash].address_id[multiSig[certifierHash].id] = msg.sender;
        multiSig[certifierHash].id++;
        multiSig[certifierHash].approved[msg.sender] = true;
        multiSig[certifierHash].count += 1;
        if (multiSig[certifierHash].count >= (certifier_admin_nb * PERCENT_TO_REVOKE_CERTIFIER / 100)) {
            for (i = 0; i < multiSigIdCount; i++) {
                if (multiSigId[i].role == CERTIFIER) {
                    multiSig[multiSigId[i]].count -= 1;
                    multiSig[multiSigId[i]].approved[target] = false;
                }
            }
            multiSig[certifierHash].count = 0;
            for (uint8 i = 0; i < multiSig[certifierHash].id; i++) {
                multiSig[certifierHash].approved[multiSig[certifierHash].address_id[i]] = false;
            }
            _revokeRole(CERTIFIER, target);
            certifier_nb -= 1;
        }
    }


    function grantAdmin(address target) external {
        require(MAX_CERTIFIERS_ADMIN > certifier_admin_nb, "Max certifiers admin reached");
        require(hasRole(CERTIFIER_ADMIN, msg.sender), "Caller is not a certifier admin");

        bytes32 certifierHash = keccak256(abi.encodePacked(target, "GRANT_CERTIFIER_ADMIN"));
        multiSigIdentifier(certifierHash);
        
        require(multiSig[certifierHash].approved[msg.sender] == false, "Certifier admin already approved");
        multiSig[certifierHash].address_id[multiSig[certifierHash].id] = msg.sender;
        multiSig[certifierHash].id++;
        multiSig[certifierHash].approved[msg.sender] = true;
        multiSig[certifierHash].count += 1;
        if (multiSig[certifierHash].count >= (certifier_admin_nb * PERCENT_TO_GRANT_CERTIFIER_ADMIN / 100)) {
            multiSig[certifierHash].count = 0;
            for (uint8 i = 0; i < multiSig[certifierHash].id; i++) {
                multiSig[certifierHash].approved[multiSig[certifierHash].address_id[i]] = false;
            }
            _grantRole(CERTIFIER_ADMIN, target);
            certifier_admin_nb += 1;
        }
    }

    function revokeAdmin(address target) external {
        require(hasRole(CERTIFIER_ADMIN, msg.sender), "Caller is not a certifier admin");
        require(hasRole(CERTIFIER_ADMIN, target), "This address is not a certifier admin");
        require(certifier_admin_nb > MIN_CERTIFIERS_ADMIN, "Min certifiers admin reached");

        bytes32 certifierHash = keccak256(abi.encodePacked(target, "REVOKE_CERTIFIER_ADMIN"));
        multiSigIdentifier(certifierHash);
        
        require(multiSig[certifierHash].approved[msg.sender] == false, "Certifier revokation already approved");
        multiSig[certifierHash].address_id[multiSig[certifierHash].id] = msg.sender;
        multiSig[certifierHash].id++;
        multiSig[certifierHash].approved[msg.sender] = true;
        multiSig[certifierHash].count += 1;
        if (multiSig[certifierHash].count >= ((certifier_admin_nb - 1) * PERCENT_TO_REVOKE_CERTIFIER / 100)) {
            for (i = 0; i < multiSigIdCount; i++) {
                if (multiSigId[i].role == CERTIFIER_ADMIN) {
                    multiSig[multiSigId[i]].count -= 1;
                    multiSig[multiSigId[i]].approved[target] = false;
                }
            }
            multiSig[certifierHash].count = 0;
            for (uint8 i = 0; i < multiSig[certifierHash].id; i++) {
                multiSig[certifierHash].approved[multiSig[certifierHash].address_id[i]] = false;
            }
            _revokeRole(CERTIFIER_ADMIN, target);
            certifier_admin_nb -= 1;
        }
    }


    function renounceRole(bytes32, address) public virtual override {
        revert("You can't renounce to you role. Please contact admins");
    }
}