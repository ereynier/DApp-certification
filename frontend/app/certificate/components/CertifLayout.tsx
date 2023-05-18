"use client"

import React, { useEffect, useState } from 'react'
import Certifications from "@artifacts/contracts/Certifications.sol/Certifications.json";
import { useContractRead } from 'wagmi';

const contractAddress: `0x${string}` = process.env.CONTRACT_ADDRESS as `0x${string}`

interface Props {
    certifId: string
}

const APPRECIATION = [
    "A",
    "B",
    "C",
    "D"
  ]
  
  const DEGREE = [
    "BACHELOR",
    "MASTER",
    "PHD"
  ]
  
  const PROGRAM = [
    "COMPUTER_SCIENCE",
    "MATHEMATICS",
    "PHYSICS",
    "CHEMISTRY",
    "BIOLOGY",
    "ECONOMICS",
    "LAW",
    "MEDICINE",
    "PHILOSOPHY",
    "LITERATURE",
    "HISTORY",
    "GEOGRAPHY",
    "ARTS",
    "MUSIC",
    "SPORTS",
    "OTHER"
  ]

const CertifLayout = ({certifId}: Props) => {

    const [certifData, setCertifData] = useState([0, 0, 0, 0, 0])

    const certif = useContractRead({
        address: contractAddress,
        abi: Certifications.abi,
        functionName: 'getCertificationById',
        args: [certifId],
    }) as {data: [number, number, number, number, number]}

    useEffect(() => {
        if (certif.data) {
          setCertifData(certif.data);
        }
      }, [certif.data]);

    const student = useContractRead({
        address: contractAddress,
        abi: Certifications.abi,
        functionName: 'getStudent',
        args: certif.data ? [certif.data[4]] : [0],
    }) as {data: [string, string, number]}


  return (
    <div className='flex flex-col items-center justify-center'>
        <h1 className="text-5xl font-extrabold dark:text-white m-5 text-center">Your degree certificate on the blockchain</h1>
        {(!certif.data || !student.data) && (
            <div className='absolute inset-y-1/2'>
                <p className='mb-2 text-lg font-normal text-gray-500 dark:text-white'>This certificate does not exist or has been deleted</p>
            </div>
        )}
        {certif.data && student.data && (
            <div>
                <hr className="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />
                <div>
                    <p className='mb-2 text-lg font-normal text-gray-500 dark:text-white'>Firstame: {student.data[0]}</p>
                    <p className='mb-2 text-lg font-normal text-gray-500 dark:text-white'>Lastame: {student.data[1]}</p>
                    <p className='mb-2 text-lg font-normal text-gray-500 dark:text-white'>Birthdate: {(new Date(Number(student.data[2]))).toLocaleDateString('en-US')}</p>
                    <p className="my-2 text-lg text-gray-400 break-all">studentId: {certif.data[4].toString()}</p>
                    <hr className="w-48 h-1 mx-auto my-4 bg-gray-100 border-0 rounded md:my-10 dark:bg-gray-700" />
                </div>
                <div className='w-full'>
                    <p className='mb-2 text-lg font-normal text-gray-500 dark:text-white'>Degree: {DEGREE[certif.data[1]]}</p>
                    <p className='mb-2 text-lg font-normal text-gray-500 dark:text-white'>Program: {PROGRAM[certif.data[2]]}</p>
                    <p className='mb-2 text-lg font-normal text-gray-500 dark:text-white'>Appreciation: {APPRECIATION[certif.data[0]]}</p>
                    <p className='mb-2 text-lg font-normal text-gray-500 dark:text-white'>Delivered: {(new Date(Number(certif.data[3]) * 1000)).toLocaleDateString('en-US')}</p>
                    <p className="my-2 text-lg text-gray-400 break-all">certificate ID: {certifId}</p>
                </div>
            </div>
        )}
    </div>
  )
}

export default CertifLayout