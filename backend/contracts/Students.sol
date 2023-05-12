// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Students {

    event StudentAdded(uint256 id, string firstname, string lastname, uint256 birthdate);
    event StudentDeleted(uint256 id);
    event StudentEdited(uint256 id, string firstname, string lastname, uint256 birthdate);

    struct Student {
        uint256 id;
        string firstname;
        string lastname;
        uint256 birthdate;
    }

    mapping (uint => Student) public students;

    function addStudent(uint _id, string memory _firstname, string memory _lastname , uint256 _birthdate) internal {
        students[_id] = Student(_id, _firstname, _lastname, _birthdate);
        emit StudentAdded(_id, _firstname, _lastname, _birthdate);
    }

    function getStudent(uint256 _id) public view returns (Student memory) {
        require(students[_id].id != 0, "Student doesn't exist");
        return students[_id];
    }

    function deleteStudent(uint256 _id) internal {
        delete students[_id];
        emit StudentDeleted(_id);
    }

    function editStudent(uint256 _id, string memory _firstname, string memory _lastname , uint256 _birthdate) internal {
        require(students[_id].id != 0, "Student does not exist");
        if (keccak256(abi.encodePacked(_firstname)) != keccak256(abi.encodePacked(students[_id].firstname)) && keccak256(abi.encodePacked(_firstname)) != keccak256(abi.encodePacked(""))) {
            students[_id].firstname = _firstname;
        }
        if (keccak256(abi.encodePacked(_lastname)) != keccak256(abi.encodePacked(students[_id].lastname)) && keccak256(abi.encodePacked(_lastname)) != keccak256(abi.encodePacked(""))) {
            students[_id].lastname = _lastname;
        }
        if (_birthdate != students[_id].birthdate && _birthdate != 0) {
            students[_id].birthdate = _birthdate;
        }
        emit StudentEdited(_id, _firstname, _lastname, _birthdate);
    }

}