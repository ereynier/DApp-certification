import React from 'react'
import { useContractRead } from 'wagmi'
import Certifications from "@artifacts/contracts/Certifications.sol/Certifications.json";

const contractAddress: `0x${string}` = process.env.CONTRACT_ADDRESS as `0x${string}`

const List = () => {

    const studentsIds = useContractRead({
        address: contractAddress,
        abi: Certifications.abi,
        functionName: 'getStudentsIds',
    }).data as number[]

    return (
        <div className='flex flex-col items-center justify-center'>
            <h2 className='text-4xl font-extrabold dark:text-white mt-10 mb-3'>Students IDs list</h2>
            <hr className="w-4/12 h-px mx-auto my-4 bg-gray-100 border-0 rounded md:my-10 dark:bg-gray-700"></hr>
            <div className='flex flex-col items-start justify-start mt-2'>
                <ul className='max-w-md space-y-1 list-disc list-inside text-lg text-gray-900 dark:text-white'>
                    {studentsIds && (
                        studentsIds.filter(id => id != 0).map((id) => (
                            <li key={id}>{id.toString()}</li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    )
}

export default List