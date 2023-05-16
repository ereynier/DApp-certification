import React from 'react'

interface Props {
    userRole: string;
    multiSigRole: string;
    count: number;
    signed: boolean;
    info: string;
}

const SingleMultiSig: React.FC<Props> = ({userRole, multiSigRole, count, signed, info}) => {
  return (
    <li className={`${userRole !== multiSigRole || count === 0 ? "hidden" : "" } flex flex-row items-center justify-between p-4 space-x-4 bg-gray-100 rounded-lg`}>
        <div className="flex flex-col items-start justify-start">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{count} signature(s)</p>
            {signed && <p className="text-xs font-medium text-green-500 dark:text-green-400">Signed</p>}
            {!signed && <p className="text-xs font-medium text-red-500 dark:text-red-400">Not signed</p>}
            <p className='text-black'>{info}</p>
            <button className='text-black'>{signed ? "Unsign" : "Sign" }</button>
        </div>
    </li>
  )
}

export default SingleMultiSig