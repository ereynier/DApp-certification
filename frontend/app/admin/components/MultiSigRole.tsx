import React, { useState } from 'react'

import Certifications from "@artifacts/contracts/Certifications.sol/Certifications.json";
import { useContractRead } from 'wagmi';
import { useContractWrite, useWaitForTransaction } from 'wagmi'

const contractAddress: `0x${string}` = process.env.CONTRACT_ADDRESS as `0x${string}`

interface Props {
    userRole: string
    setError: (error: string) => void
    setInfo: (info: string) => void
    setSuccess: (success: string) => void
}

const MultiSigRole: React.FC<Props> = ({ userRole, setError, setInfo, setSuccess }) => {
    const [role, setRole] = useState('');
    const [target, setTarget] = useState('');
    const [action, setAction] = useState('');

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

    const grantAnyRole = useContractWrite({
        address: contractAddress,
        abi: Certifications.abi,
        functionName: 'grantAnyRole',
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
    const waitGrant = useWaitForTransaction({
        hash: grantAnyRole.data?.hash,
        enabled: !!grantAnyRole.data?.hash,
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

    const revokeAnyRole = useContractWrite({
        address: contractAddress,
        abi: Certifications.abi,
        functionName: 'revokeAnyRole',
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

    const waitRevoke = useWaitForTransaction({
        hash: revokeAnyRole.data?.hash,
        enabled: !!revokeAnyRole.data?.hash,
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
        },
    })

    if (waitGrant.isLoading || waitRevoke.isLoading) {
        setSuccess("")
        setError("")
        setInfo("Transaction sent...")
    }

    const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setRole(event.target.value);
    };

    const handleTargetChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTarget(event.target.value);
    };

    const handleActionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setAction(event.target.value);
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        console.log('Action:', action);
        console.log('Role:', role);
        console.log('Target:', target);

        if (action === "Grant") {
            grantAnyRole.write({
                args: [role, target, true],
            })
        } else if (action === "Revoke") {
            revokeAnyRole.write({
                args: [role, target, true],
            })
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div className='flex flex-row items-end gap-6'>
            <div>
                    <select required onChange={handleActionChange} id="roles" className="h-10 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                        <option value="">Select an action</option>
                        <option value="Grant">Grant</option>
                        <option value="Revoke">Revoke</option>
                    </select>
                </div>
                <div>
                    <select required onChange={handleRoleChange} id="roles" className="h-10 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                        <option value="">Select a role</option>
                        <option value={String(CERTIFIER)}>Certifier</option>
                        <option value={String(CERTIFIER_ADMIN)}>Admin</option>
                    </select>
                </div>
                <div>
                    <input onChange={handleTargetChange} value={target} type="text" id="target" className="h-10 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Target address" required />
                </div>
                <button type="submit" className="h-10 w-min text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Submit</button>
            </div>
        </form>
    );
}

export default MultiSigRole