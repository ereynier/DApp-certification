import React, { useState } from 'react'

import Certifications from "@artifacts/contracts/Certifications.sol/Certifications.json";
import { useContractRead } from 'wagmi';
import SingleMultiSig from './SingleMultiSig';
import { ContractWrite, WaitTransac } from './utils/ContractWrite';

const contractAddress: `0x${string}` = process.env.CONTRACT_ADDRESS as `0x${string}`

interface Props {
    userRole: string
    address: string | undefined
    setSuccess: (success: string) => void
    setInfo: (info: string) => void
    setError: (error: string) => void
}

const MultiSigList: React.FC<Props> = ({ userRole, address, setSuccess, setInfo, setError }) => {

    const [filterSigned, setFilterSigned] = useState(true)
    const [filterUnsigned, setFilterUnsigned] = useState(true)
    const [filterDeleteStud, setFilterDeleteStud] = useState(true)
    const [filterDeleteCertif, setFilterDeleteCertif] = useState(true)
    const [filterCertify, setFilterCertify] = useState(true)
    const [filterGrant, setFilterGrant] = useState(true)
    const [filterRevoke, setFilterRevoke] = useState(true)
    const [filterSearch, setFilterSearch] = useState("")

    function resetFilters() {
        setFilterSigned(true)
        setFilterUnsigned(true)
        setFilterDeleteStud(true)
        setFilterDeleteCertif(true)
        setFilterCertify(true)
        setFilterGrant(true)
        setFilterRevoke(true)
        setFilterSearch("")
    }

    //CONTRACT READ
    const multiSig: any[] = useContractRead({
        address: contractAddress,
        abi: Certifications.abi,
        functionName: 'getAllMultiSig',
        args: [address || "0x0000000000000000000000000000000000000000"],
        watch: true,
    }).data as any[]

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
    const grantAnyRole = ContractWrite({ setSuccess, setInfo, setError, functionName: 'grantAnyRole' })
    const waitGrant = WaitTransac({ setSuccess, setInfo, setError, onSuccess: () => { }, transaction: grantAnyRole })
    const revokeAnyRole = ContractWrite({ setSuccess, setInfo, setError, functionName: 'revokeAnyRole' })
    const waitRevoke = WaitTransac({ setSuccess, setInfo, setError, onSuccess: () => { }, transaction: revokeAnyRole })

    const certify = ContractWrite({ setSuccess, setInfo, setError, functionName: 'certify' })
    const waitCertify = WaitTransac({ setSuccess, setInfo, setError, onSuccess: () => { }, transaction: certify })
    const deleteCertificate = ContractWrite({ setSuccess, setInfo, setError, functionName: 'deleteCertificate' })
    const waitDeleteCertificate = WaitTransac({ setSuccess, setInfo, setError, onSuccess: () => { }, transaction: deleteCertificate })

    const createStudent = ContractWrite({ setSuccess, setInfo, setError, functionName: 'createStudent' })
    const waitCreateStudent = WaitTransac({ setSuccess, setInfo, setError, onSuccess: () => { }, transaction: createStudent })
    const removeStudentById = ContractWrite({ setSuccess, setInfo, setError, functionName: 'removeStudentById' })
    const waitRemoveStudentById = WaitTransac({ setSuccess, setInfo, setError, onSuccess: () => { }, transaction: removeStudentById })
    const editStudentById = ContractWrite({ setSuccess, setInfo, setError, functionName: 'editStudentById' })
    const waitEditStudentById = WaitTransac({ setSuccess, setInfo, setError, onSuccess: () => { }, transaction: editStudentById })

    function signRole(signed: boolean, info: string) {
        let role = ""
        if (info.split(" ")[1].includes("CERTIFIER") && !info.split(" ")[1].includes("CERTIFIER_ADMIN")) {
            role = String(CERTIFIER)
        } else if (info.split(" ")[1].includes("CERTIFIER_ADMIN")) {
            role = String(CERTIFIER_ADMIN)
        }
        const target = info.split(" ")[2]
        if (info.includes("Grant")) {
            grantAnyRole.write({
                args: [role, target, !signed],
            })
        } else if (info.includes("Revoke")) {
            revokeAnyRole.write({
                args: [role, target, !signed],
            })
        }
    }

    function signCertification(signed: boolean, info: string) {

        if (info.includes("Certify")) {
            const studentId = info.split(" ")[1]
            const appreciation = info.split(" ")[2]
            const degree = info.split(" ")[3]
            const program = info.split(" ")[4]
            certify.write({
                args: [studentId, appreciation, degree, program, !signed],
            })
        } else if (info.includes("Delete") && !info.includes("student")) {
            const studentId = info.split(" ")[1]
            const appreciation = info.split(" ")[2]
            const degree = info.split(" ")[3]
            const program = info.split(" ")[4]
            deleteCertificate.write({
                args: [studentId, appreciation, degree, program, !signed],
            })
        } else if (info.includes("Delete student")) {
            const studentId = info.split(" ")[2]
            removeStudentById.write({
                args: [studentId, !signed],
            })
        }
    }

    function handleClick(signed: boolean, info: string) {
        if (userRole === CERTIFIER_ADMIN) {
            signRole(signed, info)
        } else if (userRole === CERTIFIER) {
            signCertification(signed, info)
        }
        setSuccess("")
        setError("")
        setInfo("Wait for transaction...")
    }

    function handleRefresh(info: string) {
        if (userRole === CERTIFIER_ADMIN) {
            signRole(false, info)
        } else if (userRole === CERTIFIER) {
            signCertification(false, info)
        }
        setSuccess("")
        setError("")
        setInfo("Wait for transaction...")
    }

    //UTILS
    const multiSigCounter = (multiSig: any) => {
        let multiSigSize: number[] = []
        if (multiSig != undefined) {
            for (let i = 0; i < multiSig[0].length; i++) {
                multiSigSize.push(i)
            }
        }
        return multiSigSize
    }

    function handleFilterSearch(event: React.ChangeEvent<HTMLInputElement>) {
        setFilterSearch(event.target.value)
    }

    function handleFilterSigned() {
        setFilterSigned(!filterSigned)
    }
    function handleFilterUnsigned() {
        setFilterUnsigned(!filterUnsigned)
    }
    function handleFilterDeleteStud() {
        setFilterDeleteStud(!filterDeleteStud)
    }
    function handleFilterDeleteCertif() {
        setFilterDeleteCertif(!filterDeleteCertif)
    }
    function handleFilterCertify() {
        setFilterCertify(!filterCertify)
    }
    function handleFilterGrant() {
        setFilterGrant(!filterGrant)
    }
    function handleFilterRevoke() {
        setFilterRevoke(!filterRevoke)
    }

    return (
        <div>
            <div className="flex flex-row justify-center items-center gap-10 mt-5">
                <div className="flex items-end ml-4 gap-4">
                    <div>
                        <input id="default-checkbox" type="checkbox" value="" checked={filterSigned} onChange={handleFilterSigned} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                        <label onClick={handleFilterSigned} className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Signed</label>
                    </div>
                    <div>
                        <input id="default-checkbox" type="checkbox" value="" checked={filterUnsigned} onChange={handleFilterUnsigned}  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                        <label onClick={handleFilterUnsigned} className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Unsigned</label>
                    </div>
                    <div className={`${userRole == CERTIFIER ? "" : "hidden"}`}>
                        <input id="default-checkbox" type="checkbox" value="" checked={filterDeleteStud} onChange={handleFilterDeleteStud} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                        <label onClick={handleFilterDeleteStud} className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Delete Student</label>
                    </div>
                    <div className={`${userRole == CERTIFIER ? "" : "hidden"}`}>
                        <input id="default-checkbox" type="checkbox" value="" checked={filterCertify} onChange={handleFilterCertify} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                        <label onClick={handleFilterCertify} className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Certify</label>
                    </div>
                    <div className={`${userRole == CERTIFIER ? "" : "hidden"}`}>
                        <input id="default-checkbox" type="checkbox" value="" checked={filterDeleteCertif} onChange={handleFilterDeleteCertif} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                        <label onClick={handleFilterDeleteCertif} className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Delete Certificate</label>
                    </div>
                    <div className={`${userRole == CERTIFIER_ADMIN ? "" : "hidden"}`}>
                        <input id="default-checkbox" type="checkbox" value="" checked={filterGrant} onChange={handleFilterGrant} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                        <label onClick={handleFilterGrant} className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Grant</label>
                    </div>
                    <div className={`${userRole == CERTIFIER_ADMIN ? "" : "hidden"}`}>
                        <input id="default-checkbox" type="checkbox" value="" checked={filterRevoke} onChange={handleFilterRevoke} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                        <label onClick={handleFilterRevoke} className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Revoke</label>
                    </div>
                </div>
                <div className="flex flex-row items-end gap-4">
                    <input type="text" value={filterSearch} onChange={(e) => setFilterSearch(e.target.value)} className="h-10 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search" />
                    <button onClick={resetFilters} className="h-10 w-content text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700">Reset filters</button>
                </div>
            </div>
            <ul className="grid grid-cols-6 m-5 gap-3">
                {multiSigCounter(multiSig).map((index) => {
                    return (
                        <SingleMultiSig key={index} userRole={userRole} multiSigRole={multiSig[0][index]} count={multiSig[1][index]} signed={multiSig[3][index]} info={multiSig[2][index]} onClick={handleClick} onRefresh={handleRefresh} />
                    )
                })}
            </ul>
        </div >
    )
}

export default MultiSigList