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
        uint8 PERCENT_TO_REVOKE;
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

    function multiSigIdentifier(bytes32 multiSigName, bytes32 role) internal {
        if (multiSig[multiSigName].created == false) {
            multiSig[multiSigName].created = true;
            multiSigId[multiSigIdCount] = multiSigName;
            multiSigIdCount += 1;
            multiSig[multiSigName].role = role;
        }
    }

    function multiSigSign(bytes32 multiSigName, address sender) internal {
        require(multiSig[multiSigName].approved[sender] == false, "You already signed this multisig");
        multiSig[multiSigName].address_id[multiSig[multiSigName].id] = sender;
        multiSig[multiSigName].id++;
        multiSig[multiSigName].approved[sender] = true;
        multiSig[multiSigName].count += 1;
    }

    function clearMultiSig(bytes32 multiSigName) internal {
        multiSig[multiSigName].count = 0;
        for (uint8 i = 0; i < multiSig[multiSigName].id; i++) {
            multiSig[multiSigName].approved[multiSig[multiSigName].address_id[i]] = false;
        }
    }

    function grantAnyRole(bytes32 roleHash, address target) external {
        Role storage role = roles[roleHash];
        require(role.MAX > role.nb, string.concat("Max ", string(abi.encodePacked(role.name)), " reached"));
        require(hasRole(role.ADMIN, msg.sender), string.concat("Caller is not a ", string(abi.encodePacked(role.name)), " admin"));
        require(hasRole(roleHash, target) == false, string.concat("This address is already a ", string(abi.encodePacked(role.name))));

        bytes32 multiSigName = keccak256(abi.encodePacked(target, "GRANT", roleHash));
        multiSigIdentifier(multiSigName, role.ADMIN);

        if (multiSig[multiSigName].approved[msg.sender] == false) {
            multiSigSign(multiSigName, msg.sender);
        }

        if (multiSig[multiSigName].count >= (roles[role.ADMIN].nb * ceilUDiv(role.PERCENT_TO_GRANT, 100))) {
            clearMultiSig(multiSigName);
            _grantRole(roleHash, target);
            role.nb += 1;
        }
    }

    function revokeAnyRole(bytes32 roleHash, address target) external {
        Role storage role = roles[roleHash];
        require(role.nb > role.MIN, string.concat("Min ", string(abi.encodePacked(role.name)), " reached"));
        require(hasRole(roleHash, target), string.concat("This address is not a ", string(abi.encodePacked(role.name))));
        require(hasRole(role.ADMIN, msg.sender), string.concat("Caller is not a ", string(abi.encodePacked(role.name)), " admin"));

        bytes32 multiSigName = keccak256(abi.encodePacked(target, "REVOKE", roleHash));
        multiSigIdentifier(multiSigName, role.ADMIN);

        if (multiSig[multiSigName].approved[msg.sender] == false) {
            multiSigSign(multiSigName, msg.sender);
        }

        if ((roleHash != role.ADMIN && multiSig[multiSigName].count >= (roles[role.ADMIN].nb * ceilUDiv(role.PERCENT_TO_REVOKE, 100))) ||
            (roleHash == role.ADMIN && multiSig[multiSigName].count >= ((roles[role.ADMIN].nb - 1) * ceilUDiv(role.PERCENT_TO_REVOKE, 100))))
        {

            for (uint i = 0; i < multiSigIdCount; i++) {
                if (multiSig[multiSigId[i]].approved[target] == true && multiSig[multiSigId[i]].role == roleHash) {
                    multiSig[multiSigId[i]].count -= 1;
                    multiSig[multiSigId[i]].approved[target] = false;
                }
            }
            
            clearMultiSig(multiSigName);
            _revokeRole(roleHash, target);
            role.nb -= 1;
        }
    }

    function renounceRole(bytes32, address) public virtual override {
        revert("You can't renounce to your role. Please contact admins");
    }
}