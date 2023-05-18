"use client"
import React, { useEffect, useState } from 'react'
import PromptID from './PromptID'
import { useSearchParams } from 'next/navigation'

interface Props {
    certifId: string
}

const Certificate = () => {

    const [certifId, setCertifId] = useState('')

    const searchParams = useSearchParams()

    useEffect(() => {
        setCertifId(searchParams.get("ID") || "")    
    }, [searchParams])

  return (
    <div>
        {certifId && (
            <p>Certificate {certifId}</p>
        )}
        {!certifId && (
            <PromptID />
        )}
    </div>
  )
}

export default Certificate