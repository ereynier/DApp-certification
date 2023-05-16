import React from 'react'

import Certifications from "@artifacts/contracts/Certifications.sol/Certifications.json";
import { useAccount, useContractRead } from 'wagmi';

import "dotenv/config";

const contractAddress: string = String(process.env.CONTRACT_ADDRESS) || ""

interface Props {
    role: string
}

const MultiSigList: React.FC<Props> = ({role}) => {
    
    const multiSigId = useContractRead({
        address: contractAddress,
        abi: Certifications.abi,
        functionName: 'multiSigId',
    }).data

    console.log(multiSigId)

  return (
    <div>MultiSigList {role}</div>
  )
}

export default MultiSigList