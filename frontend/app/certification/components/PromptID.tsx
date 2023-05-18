"use client"

import { useRouter } from 'next/navigation';
import React, { useState } from 'react'

const PromptID = () => {

    const router = useRouter();

    const [promptCertifId, setPromptCertifId] = useState('')

    const handleCertifId = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPromptCertifId(e.target.value)
    }

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        router.push(`/certificate?ID=${promptCertifId}`)
    }

    return (
        <div className='flex flex-col items-center justify-center h-screen w-screen'>
            <div className='absolute mb-60 flex flex-col items-center justify-center'>
                <h1 className='mb-4 text-5xl font-extrabold leading-none tracking-tight text-gray-900 dark:text-white'>Certifications</h1>
                <p className='mb-6 text-lg font-normal text-gray-500 lg:text-xl sm:px-16 xl:px-48 dark:text-gray-400'>Please enter your certification ID</p>
            </div>
            <form className='absolute flex sm:flex-row flex-col items-start justify-center gap-4 w-6/12' onSubmit={handleSubmit}>
                <input required onChange={handleCertifId} value={promptCertifId} className="appearence-non h-12 bg-gray-50 border border-gray-300 text-gray-900 text-mb rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" type='text' placeholder='Certification ID' />
                <button type='submit' className='h-12 ext-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-mb px-5 py-2.5 text-center mr-2'>Submit</button>
            </form>

        </div>
    )
}

export default PromptID