import React, { use, useState } from 'react'

import Certifications from "@artifacts/contracts/Certifications.sol/Certifications.json";
import { useAccount, useContractRead } from 'wagmi';
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

const MultiSigList: React.FC<Props> = ({userRole, address, setSuccess, setInfo, setError}) => {
    

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
    const grantAnyRole = ContractWrite({setSuccess, setInfo, setError, functionName: 'grantAnyRole'})
    const waitGrant = WaitTransac({setSuccess, setInfo, setError, setTarget: (target: string) => {}, transaction: grantAnyRole})
    const revokeAnyRole = ContractWrite({setSuccess, setInfo, setError, functionName: 'revokeAnyRole'})
    const waitRevoke = WaitTransac({setSuccess, setInfo, setError, setTarget: (target: string) => {}, transaction: revokeAnyRole})

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

    function handleRefresh(info:string) {
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
            for (let i = 0 ; i < multiSig[0].length; i++) {
                multiSigSize.push(i)
            }
        }
        return multiSigSize
    }

    return (
        <div>
            <ul className="grid grid-cols-6 m-5 gap-3">
                {multiSigCounter(multiSig).map((index) => {
                    return (
                        <SingleMultiSig key={index} userRole={userRole} multiSigRole={multiSig[0][index]} count={multiSig[1][index]} signed={multiSig[3][index]} info={multiSig[2][index]} onClick={handleClick} onRefresh={handleRefresh}/>
                    )
                })}
            </ul>
        </div>
    )
}

export default MultiSigList