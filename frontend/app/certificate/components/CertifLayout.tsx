"use client"

import React, { useEffect, useState } from 'react'
import Certifications from "@artifacts/contracts/Certifications.sol/Certifications.json";
import { useContractRead } from 'wagmi';

const contractAddress: `0x${string}` = process.env.CONTRACT_ADDRESS as `0x${string}`

interface Props {
    certifId: string
}

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
    <div>
        <h1>Certificate</h1>
        {(!certif.data || !student.data) && (
            <div>
                <p>This certificate does not exist or has been deleted</p>
            </div>
        )}
        {certif.data && student.data && (
            <div>
                <div>
                    <p>studentId: {certif.data[4].toString()}</p>
                    <p>Firstame: {student.data[0]}</p>
                    <p>Lastame: {student.data[1]}</p>
                    <p>Birthdate: {(new Date(Number(student.data[2]))).toLocaleDateString('en-US')}</p>
                    <br />
                </div>
                <div>
                    <p>certifId: {certifId}</p>
                    <p>Appreciation: {certif.data[0].toString()}</p>
                    <p>Degree: {certif.data[1].toString()}</p>
                    <p>Program: {certif.data[2].toString()}</p>
                    <p>Delivered: {(new Date(Number(certif.data[3]) * 1000)).toLocaleDateString('en-US')}</p>
                </div>
            </div>
        )}
    </div>
  )
}

export default CertifLayout