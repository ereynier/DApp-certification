import { useContractWrite, useWaitForTransaction } from "wagmi"

import Certifications from "@artifacts/contracts/Certifications.sol/Certifications.json";
const contractAddress: `0x${string}` = process.env.CONTRACT_ADDRESS as `0x${string}`


interface ContractWriteProps {
    setSuccess: (success: string) => void
    setInfo: (info: string) => void
    setError: (error: string) => void
    functionName: string
}

export function ContractWrite({setSuccess, setInfo, setError, functionName}: ContractWriteProps): any {
    const contractWrite = useContractWrite({
        address: contractAddress,
        abi: Certifications.abi,
        functionName: functionName,
        onError: (error: any) => {
            setSuccess("")
            setInfo("")
            console.log({error})
            if (error.details) {
                setError(error.details)
            } else {
                setError(error.message)
            }
        }
    })
    return contractWrite
}

interface WaitTransacProps {
    setSuccess: (success: string) => void
    setInfo: (info: string) => void
    setError: (error: string) => void
    setTarget: (target: string) => void
    transaction: any
}

export function WaitTransac({setSuccess, setInfo, setError, setTarget, transaction}: WaitTransacProps): any {
    const waitTransac = useWaitForTransaction({
        hash: transaction.data?.hash,
        enabled: !!transaction.data?.hash,
        onSuccess(data) {
            console.log('Transaction successful:', data)
            setInfo("")
            setError("")
            setTarget("")
            setSuccess("Transaction successful")
            setTimeout(() => {
                setSuccess("")
            }, 5000)
        },
        onError(error: any) {
            console.log('Transaction error:', error)
            setInfo("")
            setSuccess("")
            console.log({error})
            if (error.details) {
                setError(error.details)
            } else {
                setError(error.message)
            }
        }
    })
    return waitTransac
}