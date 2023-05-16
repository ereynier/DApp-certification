import React from 'react'

import Certifications from "@artifacts/contracts/Certifications.sol/Certifications.json";
import { useAccount, useContractRead } from 'wagmi';


const contractAddress= "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"

interface Props {
    role: string
}

const MultiSigList: React.FC<Props> = ({role}) => {
    
    const multiSigIdCount = useContractRead({
        address: contractAddress,
        abi: Certifications.abi,
        functionName: 'multiSigIdCount',
    }).data

    console.log(multiSigIdCount)

  return (
    <div>MultiSigList {role}</div>
  )
}

export default MultiSigList