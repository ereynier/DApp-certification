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
    const [appreciation, setAppreciation] = useState('');
    const [degree, setDegree] = useState('');
    const [program, setProgram] = useState('');

    function resetFields() {
        setStudentId('')
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



    const certify = ContractWrite({ setSuccess, setInfo, setError, functionName: 'certify' })


    const waitCertify = WaitTransac({ setSuccess, setInfo, setError, onSuccess: resetFields, transaction: certify })


    const deleteCertificate = ContractWrite({ setSuccess, setInfo, setError, functionName: 'deleteCertificate' })


    const waitDeleteCertificate = WaitTransac({ setSuccess, setInfo, setError, onSuccess: resetFields, transaction: deleteCertificate })




    //HANDLE CHANGE
    const handleActionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setAction(event.target.value);
    };

    const handleAppreciationChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setAppreciation(event.target.value);
    };

    const handleDegreeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setDegree(event.target.value);
    };

    const handleProgramChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setProgram(event.target.value);
    };

    const handleStudentIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setStudentId(event.target.value);
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        console.log('Action:', action);
        console.log('Appreciation:', appreciation);
        console.log('Degree', degree);
        console.log('Program', program);
        console.log('StudentId', studentId);

        if (action === "Create") {
            certify.write({
                args: [studentId, appreciation, degree, program, true],
            })
        } else if (action === "Delete") {
            deleteCertificate.write({
                args: [studentId, appreciation, degree, program, true],
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
                    </select>
                </div>
                <div>
                    <select required onChange={handleDegreeChange} id="roles" className="h-10 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                        <option value="">Degree</option>
                        <option value={0}>BACHELOR</option>
                        <option value={1}>MASTER</option>
                        <option value={2}>PHD</option>
                    </select>
                </div>
                <div>
                    <select required onChange={handleProgramChange} id="roles" className="h-10 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                        <option value="">Program</option>
                        <option value={0}>COMPUTER_SCIENCE</option>
                        <option value={1}>MATHEMATICS</option>
                        <option value={2}>PHYSICS</option>
                        <option value={3}>CHEMISTRY</option>
                        <option value={4}>BIOLOGY</option>
                        <option value={5}>ECONOMICS</option>
                        <option value={6}>LAW</option>
                        <option value={7}>MEDICINE</option>
                        <option value={8}>PHILOSOPHY</option>
                        <option value={9}>LITERATURE</option>
                        <option value={10}>HISTORY</option>
                        <option value={11}>GEOGRAPHY</option>
                        <option value={12}>ARTS</option>
                        <option value={13}>MUSIC</option>
                        <option value={14}>SPORTS</option>
                        <option value={15}>OTHER</option>
                    </select>
                </div>
                <div>
                    <select required onChange={handleAppreciationChange} id="roles" className="h-10 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                        <option value="">Appreciation</option>
                        <option value={0}>A</option>
                        <option value={1}>B</option>
                        <option value={2}>C</option>
                        <option value={3}>D</option>
                    </select>
                </div>
                <div>
                    <input onChange={handleStudentIdChange} value={studentId} type="number" id="target" className="appearance-none h-10 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Student ID" required />
                </div>
                <button type="submit" className="h-10 w-min text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Submit</button>
            </div>
        </form>
    );
}

export default MultiSigCertif