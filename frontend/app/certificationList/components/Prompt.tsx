import React, { useState } from 'react'

interface Props {
    onSubmit: (studentId: number) => void
}

const Prompt = ({onSubmit} : Props) => {
    
    const [studentId, setStudentId] = useState("")

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        onSubmit(Number(studentId))
    }

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        setStudentId(event.target.value)
    }

    return (
    <form onSubmit={handleSubmit} className='absolute top-10 flex sm:flex-row flex-col items-start justify-center gap-4 w-6/12'>
        <input required onChange={handleChange} value={studentId}  className="appearence-non h-12 bg-gray-50 border border-gray-300 text-gray-900 text-mb rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" type="number" placeholder="Enter your student ID" />
        <button className='h-12 ext-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-mb px-5 py-2.5 text-center mr-2'>Search</button>
    </form>
  )
}

export default Prompt