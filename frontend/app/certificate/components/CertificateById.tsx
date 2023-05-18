"use client"
import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import CertifLayout from './CertifLayout'

const CertificateById = () => {

    const [certifId, setCertifId] = useState('')

    const searchParams = useSearchParams()

    useEffect(() => {
        setCertifId(searchParams.get("ID") || "")
    }, [searchParams])


  return (
    <div>
        <CertifLayout certifId={certifId} />
    </div>
  )
}

export default CertificateById