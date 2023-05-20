import React from 'react'

interface Props {
    userRole: string;
    multiSigRole: string;
    count: number;
    signed: boolean;
    info: string;
    onClick: (signed:boolean, info: string) => void;
    onRefresh: (info: string) => void;
    filters: {
      filterSearch: string;
      filterSigned: boolean;
      filterUnsigned: boolean;
      filterDeleteStud: boolean;
      filterDeleteCertif: boolean;
      filterCertify: boolean;
      filterGrant: boolean;
      filterRevoke: boolean;

    }
}

const APPRECIATION = [
  "A",
  "B",
  "C",
  "D"
]

const DEGREE = [
  "BACHELOR",
  "MASTER",
  "PHD"
]

const PROGRAM = [
  "COMPUTER_SCIENCE",
  "MATHEMATICS",
  "PHYSICS",
  "CHEMISTRY",
  "BIOLOGY",
  "ECONOMICS",
  "LAW",
  "MEDICINE",
  "PHILOSOPHY",
  "LITERATURE",
  "HISTORY",
  "GEOGRAPHY",
  "ARTS",
  "MUSIC",
  "SPORTS",
  "OTHER"
]

const SingleMultiSig: React.FC<Props> = ({userRole, multiSigRole, count, signed, info, onClick, onRefresh, filters}) => {

  function formatInfo (info: string): string {
    if (info.includes("Certify")) {
        const studentId = info.split(" ")[1]
        const appreciation = APPRECIATION[parseInt(info.split(" ")[2], 10)]
        const degree = DEGREE[parseInt(info.split(" ")[3], 10)]
        const program = PROGRAM[parseInt(info.split(" ")[4], 10)]
        return `Certify student ${studentId}: ${degree} ${program} ${appreciation}`
    } else if (info.includes("Delete") && !info.includes("student")) {
        const studentId = info.split(" ")[1]
        const appreciation = APPRECIATION[parseInt(info.split(" ")[2], 10)]
        const degree = DEGREE[parseInt(info.split(" ")[3], 10)]
        const program = PROGRAM[parseInt(info.split(" ")[4], 10)]
        return `Delete student ${studentId}: ${degree} ${program} ${appreciation}`
    } else if (info.includes("Delete student")) {
        const studentId = info.split(" ")[2]
        return `Delete student ${studentId}`
    } else if (info.includes("Grant")) {
        const role = info.split(" ")[1]
        const target = info.split(" ")[2]
        return `Grant ${role} to ${target.substring(0,5)}...`
    } else if (info.includes("Revoke")) {
        const role = info.split(" ")[1]
        const target = info.split(" ")[2]
        return `Revoke ${role} from ${target.substring(0,5)}...`
    }
    return info
  }

  function filtering() {
    if (userRole !== multiSigRole) {
      return true
    }
    if (count === 0) {
      return true
    }
    if (filters.filterSearch !== "") {
      if (!formatInfo(info).toLocaleLowerCase().includes(filters.filterSearch.toLocaleLowerCase())) {
        return true
      }
    }
    if (!filters.filterSigned && signed) {
      return true
    }
    if (!filters.filterUnsigned && !signed) {
      return true
    }
    if (!filters.filterDeleteStud && info.includes("Delete student")) {
      return true
    }
    if (!filters.filterDeleteCertif && info.includes("Delete") && !info.includes("student")) {
      return true
    }
    if (!filters.filterCertify && info.includes("Certify")) {
      return true
    }
    if (!filters.filterGrant && info.includes("Grant")) {
      return true
    }
    if (!filters.filterRevoke && info.includes("Revoke")) {
      return true
    }
    return false
  }

  return (
    <li className={`${filtering() ? "hidden" : "" } w-64 sm:w-auto sm:h-auto flex flex-row items-center justify-between p-4 space-x-4 bg-gray-100 rounded-lg hover:scale-105 transition`}>
        <div className="flex flex-col items-start justify-start w-64 h-36">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{count} signature(s)</p>
            {signed && <p className="text-xs font-medium text-green-500 dark:text-green-400">Signed</p>}
            {!signed && <p className="text-xs font-medium text-red-500 dark:text-red-400">Not signed</p>}
            <p className='text-black'><span title={info.includes("Grant") || info.includes("Revoke") ? info.split(" ")[2] : ""}>{formatInfo(info)}</span></p>
            <div className='flex flex-row gap-5 mt-auto w-full justify-between'>
              <button onClick={() => onClick(signed, info)} className={`${signed ? "text-red-800" : "text-green-500" }`}>{signed ? "Unsign" : "Sign" }</button>
              <button onClick={() => onRefresh(info)} className='text-black'>Sign and refresh</button>
            </div>
        </div>
    </li>
  )
}

export default SingleMultiSig