import React from 'react'
import { useContractRead } from 'wagmi'
import Certifications from "@artifacts/contracts/Certifications.sol/Certifications.json";
import Link from 'next/link';

const contractAddress: `0x${string}` = process.env.CONTRACT_ADDRESS as `0x${string}`

interface Props {
    studentId: string
}

const List = ({studentId}: Props) => {
  
    const certif = useContractRead({
        address: contractAddress,
        abi: Certifications.abi,
        functionName: 'getCertificatesByStudent',
        args: [studentId],
    }) as {data: number[]}

    return (
    <div>
        {(!certif.data) && (
            <div>
                <p className='mb-6 text-lg font-normal text-gray-500 lg:text-xl sm:px-16 xl:px-48 dark:text-gray-400'>This student does not exist or has been deleted</p>
            </div>
        )}
        {certif.data && certif.data.length == 0 && (
            <div className=''>
                <p className='mb-6 text-lg font-normal text-gray-500 lg:text-xl sm:px-16 xl:px-48 dark:text-gray-400'>This student have no certificate</p>
            </div>
        )}
        {certif.data && (
        <ul className='space-y-2 text-gray-500 list-disc list-inside dark:text-gray-200'>
            {certif.data && certif.data.map((certifId) => (
                <li key={certifId}>
                    <Link target='_blank' className='font-medium text-blue-600 underline dark:text-blue-500 hover:no-underline' href={`/certificate?ID=${certifId}`}>{certifId}</Link>
                </li>
            ))}
        </ul>
        )}
    </div>
  )
}

export default List