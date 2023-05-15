"use client"
import React, { useEffect } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit';

import Certifications from "@artifacts/contracts/Certifications.sol/Certifications.json";
import { useAccount, useContractRead } from 'wagmi';

const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'

export default function Test() {


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


    const { address, isConnected } = useAccount()


    let isCertifier = useContractRead({
        address: contractAddress,
        abi: Certifications.abi,
        functionName: 'hasRole',
        args: [CERTIFIER, address],
        watch: true,
    }).data || false

    let isCertifierAdmin = useContractRead({
        address: contractAddress,
        abi: Certifications.abi,
        functionName: 'hasRole',
        args: [CERTIFIER_ADMIN, address],
        watch: true,
    }).data || false


  return (
    <div className='flex flex-col items-end justify-start m-5'>
        <ConnectButton />
        <div>
            {isConnected && <p>Connected to {address}</p>}
            {isCertifier && <p>isCertifier</p>}
            {isCertifierAdmin && <p>isCertifierAdmin</p>}
        </div>
    </div>
  )
}