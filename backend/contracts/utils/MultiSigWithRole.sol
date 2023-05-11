// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract MultiSigWithRole {

    struct MultiSigRole {
        bool created; // is the multisig created
        bytes32 role; // role requiered to sign
        uint8 count; // number of signers
        uint8 id; // ids to retrieve signers
        mapping (address => bool) approved; // signers approved
        mapping (uint => address) address_id; // signers list
        string info; // info about the multisig
    }

    function multiSigRoleSign(MultiSigRole storage multiSig, address sender) internal {
        require(multiSig.approved[sender] == false, "You already signed this multisig");
        multiSig.address_id[multiSig.id] = sender;
        multiSig.id++;
        multiSig.approved[sender] = true;
        multiSig.count += 1;
    }

    function multiSigRoleUnsign(MultiSigRole storage multiSig, address sender) internal {
        require(multiSig.approved[sender] == true, "You have note signed this multisig yet");
        multiSig.approved[sender] = false;
        multiSig.count -= 1;
    }

    function clearMultiSigRole(MultiSigRole storage multiSig) internal {
        multiSig.count = 0;
        for (uint8 i = 0; i < multiSig.id; i++) {
            multiSig.approved[multiSig.address_id[i]] = false;
        }
    }
}