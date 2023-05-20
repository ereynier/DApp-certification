import Link from 'next/link'
import React from 'react'


const Welcome: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3">
      <h1 className="text-4xl font-bold">Welcome to Certification dapp</h1>
      <p className="text-xl">Please use your <Link className='underline font-semibold' href={"/certification"}>Certification ID</Link> or your <Link className='underline font-semibold' href={"/certificationList"}>student ID</Link> to see your certifications.</p>
      <p className="text-xl">You chan check the students IDs list <Link className='underline font-semibold' href={"/studentsList"}>here</Link> and use them to retrieve certifications IDs</p>
      <p className="text-xl">Admins can use this <Link className='underline font-semibold' href={"/admin"}>page</Link> to create new certifications.</p>
    </div>
  )
}

export default Welcome