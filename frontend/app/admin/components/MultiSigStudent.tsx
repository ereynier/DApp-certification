import React, { useState } from 'react'

import Certifications from "@artifacts/contracts/Certifications.sol/Certifications.json";
import { useContractRead } from 'wagmi';
import { ContractWrite, WaitTransac } from './utils/ContractWrite';

const contractAddress: `0x${string}` = process.env.CONTRACT_ADDRESS as `0x${string}`

interface Props {
    userRole: string
    setError: (error: string) => void
    setInfo: (info: string) => void
    setSuccess: (success: string) => void
}

const MultiSigCertif: React.FC<Props> = ({ userRole, setError, setInfo, setSuccess }) => {
    const [action, setAction] = useState('');
    const [studentId, setStudentId] = useState("");
    const [firstname, setFirstname] = useState('');
    const [lastName, setLastname] = useState('');
    const [birthdate, setBirthdate] = useState(new Date(Date.now()).toLocaleDateString('en-US'));

    function resetFields() {
        setStudentId('')
        setFirstname('')
        setLastname('')
        setBirthdate(new Date(Date.now()).toLocaleDateString('en-US'))
    }

    //CONTRACT READ
    const CERTIFIER = useContractRead({
        address: contractAddress,
        abi: Certifications.abi,
        functionName: 'CERTIFIER',
    }).data

    const CERTIFIER_ADMIN = useContractRead({
        address: contractAddress,
        abi: Certifications.abi,
        functionName: 'CERTIFIER_ADMIN',
    }).data

    //CONTRACT WRITE



    const createStudent = ContractWrite({ setSuccess, setInfo, setError, functionName: 'createStudent' })

    const waitCreateStudent = WaitTransac({ setSuccess, setInfo, setError, onSuccess: resetFields, transaction: createStudent })

    const removeStudentById = ContractWrite({ setSuccess, setInfo, setError, functionName: 'removeStudentById' })

    const waitRemoveStudentById = WaitTransac({ setSuccess, setInfo, setError, onSuccess: resetFields, transaction: removeStudentById })

    const editStudentById = ContractWrite({ setSuccess, setInfo, setError, functionName: 'editStudentById' })

    const waitEditStudentById = WaitTransac({ setSuccess, setInfo, setError, onSuccess: resetFields, transaction: editStudentById })




    //HANDLE CHANGE
    const handleActionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setAction(event.target.value);
        if (event.target.value === "Edit") {
            setFirstname("")
            setLastname("")
            setBirthdate(new Date(Date.now()).toLocaleDateString('en-US'))
        }
    };

    const handleFirstnameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFirstname(event.target.value);
    };

    const handleLastnameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLastname(event.target.value);
    };

    const handleBirthdateChange = (event: React.ChangeEvent<HTMLInputElement>) => {

        setBirthdate(event.target.value);
    };

    const handleStudentIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setStudentId(event.target.value);
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        const newDate = new Date(birthdate).getTime();

        console.log('Action: ', action);
        console.log('Firstname: ', firstname);
        console.log('Lastname: ', lastName);
        console.log(`Birthdate: ${birthdate} ${newDate}`);
        console.log('StudentId: ', studentId);
        

        if (action === "Create") {
            createStudent.write({
                args: [studentId, firstname, lastName, newDate],
            })
        } else if (action === "Delete") {
            removeStudentById.write({
                args: [studentId, true],
            })
        } else if (action === "Edit") {
            editStudentById.write({
                args: [studentId, firstname, lastName, newDate],
            })
        }
        setSuccess("")
        setError("")
        setInfo("Wait for transaction...")
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div className='flex flex-row items-end gap-6'>
                <div>
                    <select required onChange={handleActionChange} id="roles" className="h-10 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                        <option value="">Select an action</option>
                        <option value="Create">Create</option>
                        <option value="Delete">Delete</option>
                        <option value="Edit">Edit</option>
                    </select>
                </div>
                <div>
                    <input disabled={action == "Delete" ? true : false} onChange={handleFirstnameChange} value={firstname} type="text" className={`${action == "Delete" ? "cursor-not-allowed" : ""} h-10 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`} placeholder="Firstname" required={action == "Delete" ? false : true}  />
                </div>
                <div>
                    <input disabled={action == "Delete" ? true : false} onChange={handleLastnameChange} value={lastName} type="text" className={`${action == "Delete" ? "cursor-not-allowed" : ""} h-10 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`} placeholder="Lastname" required={action == "Delete" ? false : true}  />
                </div>
                <div>
                    <input disabled={action == "Delete" ? true : false} onChange={handleBirthdateChange} value={birthdate} type="date" className={`${action == "Delete" ? "cursor-not-allowed" : ""} appearance-none h-10 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`} placeholder="Birthdate" required={action == "Delete" ? false : true}  />
                </div>
                <div>
                    <input onChange={handleStudentIdChange} value={studentId} type="number" className="appearance-none h-10 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Student ID" required />
                </div>
                <button type="submit" className="h-10 w-min text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Submit</button>
            </div>
        </form>
    );
}

export default MultiSigCertif