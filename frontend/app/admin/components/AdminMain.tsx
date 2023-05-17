"use client"
import React, { useEffect, useState } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit';

import Certifications from "@artifacts/contracts/Certifications.sol/Certifications.json";
import { useAccount, useContractRead } from 'wagmi';
import MultiSigList from './MultiSigList';
import MultiSigRole from './MultiSigRole';
import MultiSigStudent from './MultiSigStudent';
import { ToastError } from './utils/ToastError';
import { ToastPending } from './utils/ToastPending';
import { ToastSuccess } from './utils/ToastSuccess';
import MultiSigCertif from './MultiSigCertif';

const contractAddress: `0x${string}` = process.env.CONTRACT_ADDRESS as `0x${string}`
const inactiveTabCss = "hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300"
const activeTabCss = "text-blue-600 bg-gray-100 rounded-t-lg active dark:bg-gray-800 dark:text-blue-500"

export default function AdminMain() {

    const [error, setError] = useState("");
    const [info, setInfo] = useState("");
    const [success, setSuccess] = useState("");
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

    const CERTIFIER_NB: number = Number(useContractRead({
        address: contractAddress,
        abi: Certifications.abi,
        functionName: 'getRoleMembersNb',
        args: [CERTIFIER],
        watch: true,
    }).data)

    const CERTIFIER_ADMIN_NB: number = Number(useContractRead({
        address: contractAddress,
        abi: Certifications.abi,
        functionName: 'getRoleMembersNb',
        args: [CERTIFIER_ADMIN],
        watch: true,
    }).data)

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
            <div className="flex justify-center flex-col">
                <ToastError error={error} onClick={() => setError("")} />
                <ToastPending info={info} onClick={() => setInfo("")} />
                <ToastSuccess msg={success} onClick={() => setSuccess("")} />
            </div>
            <div className="absolute top-10 sm:top-0 left-0 mt-5">
                <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:border-gray-700 dark:text-gray-400 w-screen">
                    {isCertifier &&
                        <li className="mr-2 ml-5">
                            <a onClick={() => handleTabChange(0)} aria-current="page" className={`inline-block p-4 rounded-t-lg ${activeTab == 0 ? activeTabCss : inactiveTabCss}`}>Certifier ({CERTIFIER_NB})</a>
                        </li>
                    }
                    {isCertifierAdmin &&
                        <li className={`mr-2 ${isCertifier ? "" : "ml-5"}`}>
                            <a onClick={() => handleTabChange(1)} className={`inline-block p-4 rounded-t-lg ${activeTab == 1 ? activeTabCss : inactiveTabCss}`}>Admin ({CERTIFIER_ADMIN_NB})</a>
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
            </div>
            <div className=''>
                {isConnected && isCertifier && activeTab == 0 && (
                    <div>
                        <MultiSigStudent userRole={String(CERTIFIER)} setError={setError} setInfo={setInfo} setSuccess={setSuccess} />
                        <MultiSigCertif userRole={String(CERTIFIER_ADMIN)} setError={setError} setInfo={setInfo} setSuccess={setSuccess} />
                    </div>
                    )}
                {isConnected && isCertifierAdmin && activeTab == 1 && (
                    <MultiSigRole userRole={String(CERTIFIER)} setError={setError} setInfo={setInfo} setSuccess={setSuccess} />
                )}
            </div>
            <div>
                {isConnected && isCertifier && activeTab == 0 && (
                    <MultiSigList userRole={String(CERTIFIER)} address={address} setSuccess={setSuccess} setInfo={setInfo} setError={setError} />
                )}
                {isConnected && isCertifierAdmin && activeTab == 1 && (
                    <MultiSigList userRole={String(CERTIFIER_ADMIN)} address={address} setSuccess={setSuccess} setInfo={setInfo} setError={setError} />
                )}
            </div>
        </div>
    )
}