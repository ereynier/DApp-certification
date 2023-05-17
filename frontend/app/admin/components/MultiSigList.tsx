import React, { useState } from 'react'

import Certifications from "@artifacts/contracts/Certifications.sol/Certifications.json";
import { useAccount, useContractRead } from 'wagmi';
import SingleMultiSig from './SingleMultiSig';

const contractAddress: `0x${string}` = process.env.CONTRACT_ADDRESS as `0x${string}`

interface Props {
    userRole: string
    address: string | undefined
}

const MultiSigList: React.FC<Props> = ({userRole, address}) => {
    

    const multiSig: any[] = useContractRead({
        address: contractAddress,
        abi: Certifications.abi,
        functionName: 'getAllMultiSig',
        args: [address || "0x0000000000000000000000000000000000000000"],
        watch: true,
    }).data as any[]

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
                        <SingleMultiSig key={index} userRole={userRole} multiSigRole={multiSig[0][index]} count={multiSig[1][index]} signed={multiSig[3][index]} info={multiSig[2][index]} />
                    )
                })}
            </ul>
        </div>
    )
}

export default MultiSigList