import Link from 'next/link'
import React from 'react'


const Welcome: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3">
      <h1 className="text-4xl font-bold">Welcome to Certification dapp</h1>
      <p className="text-xl">Unless you are an admin, please use your links to see your <Link className='underline font-semibold' href={"/certification"}>certifications</Link>.</p>
      <p className="text-xl">Admins can use this <Link className='underline font-semibold' href={"/admin"}>page</Link> to create new certifications.</p>
    </div>
  )
}

export default Welcome