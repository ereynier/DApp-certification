// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Maths {
    function ceilUDiv(uint a, uint b) public pure returns(uint) {
        if (a % b == 0) {
            return (a / b);
        } else {
            return ((a / b) + 1);
        }
    }
}