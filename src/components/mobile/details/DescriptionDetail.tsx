'use client'
import { SteamDetailsDataType } from "@/types/api/getSteamDetailType"
import { useState } from "react"

type Props = {
  data: SteamDetailsDataType
}

const DescriptionDetail = (props:Props) => {

  const { data } = props

  const [ isOpen, setIsOpen ] = useState(false)

  return (
    <div className="text-white">
      {isOpen ? (
        <div className="bg-gray-800 rounded-lg p-4 shadow-md flex flex-col space-y-2">
          <div className="flex flex-col">
            {data.shortDetails}
            <div className="flex flex-wrap">
              {data.tags.map((tag, index) => (
                <span key={index} className="text-blue-500">#{tag}&nbsp;</span>
              ))}
            </div>

          </div>
          <div className="" onClick={()=>setIsOpen(!isOpen)}>閉じる</div>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg p-4 shadow-md flex flex-col space-y-2 text-blue-500" onClick={() => setIsOpen(!isOpen)}>
          詳細情報を表示
        </div>
      )}
    </div>
  )
}

export default DescriptionDetail