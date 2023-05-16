"use client"
import React, { useEffect, useState } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit';

import Certifications from "@artifacts/contracts/Certifications.sol/Certifications.json";
import { useAccount, useContractRead } from 'wagmi';
import MultiSigList from './MultiSigList';

const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
const inactiveTabCss = "hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300"
const activeTabCss = "text-blue-600 bg-gray-100 rounded-t-lg active dark:bg-gray-800 dark:text-blue-500"

export default function AdminConnect() {


    const [activeTab, setActiveTab] = useState(0);


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

    useEffect(() => {
        if (isCertifier) {
            setActiveTab(0);
        } else if (isCertifierAdmin) {
            setActiveTab(1);
        }
    }, [isCertifier, isCertifierAdmin])

    const handleTabChange = (tab: number) => {
        setActiveTab(tab);
    }


    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <div className="absolute top-10 sm:top-0 left-0 mt-5">
                <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:border-gray-700 dark:text-gray-400 w-screen">
                    {isCertifier &&
                        <li className="mr-2 ml-5">
                            <a href='#certifier' onClick={() => handleTabChange(0)} aria-current="page" className={`inline-block p-4 rounded-t-lg ${ activeTab == 0 ? activeTabCss : inactiveTabCss }`}>Certifier</a>
                        </li>
                    }
                    {isCertifierAdmin &&
                        <li className={`mr-2 ${isCertifier ? "" : "ml-5"}`}>
                            <a href="#admin" onClick={() => handleTabChange(1)} className={`inline-block p-4 rounded-t-lg ${ activeTab == 1 ? activeTabCss : inactiveTabCss }`}>Admin</a>
                        </li>
                    }
                    {!isCertifier && !isCertifierAdmin &&
                        <li className="mr-2">
                            <a href="" className="inline-block p-5 rounded-t-lg"></a>
                        </li>
                    }
                </ul>
            </div>
            <div className="absolute top-0 right-0 m-5">
                <ConnectButton />
            </div>
            <div className="flex flex-col items-center justify-center">
                {isConnected && !isCertifier && !isCertifierAdmin && (
                    <p className="text-center leading-loose text-lg">
                        You are connected with: {address}
                        <br />
                        <span className="font-bold">You have no role.</span>
                        <br />
                        Please switch account or use your links to see your certifications
                    </p>
                )}
                {!isConnected && (
                    <p className="text-center leading-loose text-lg">
                        Please connect an admin wallet
                        <br />
                        If you are not an admin use your links to see your certifications
                    </p>
                )}
                {isConnected && isCertifier && activeTab == 0 && (
                    <MultiSigList role={String(CERTIFIER)}/>
                )}
                {isConnected && isCertifierAdmin && activeTab == 1 && (
                    <MultiSigList role={String(CERTIFIER_ADMIN)}/>
                )}
            </div>
        </div>
    )
}