import React from 'react'

type Props = {
  baseStyle: string,
  txtStyle: string,
  percent: number
}

const PercentBar = (props:Props) => {

  const { baseStyle, txtStyle, percent } = props;

  return (
    <div className="w-full bg-gray-300 rounded-lg relative h-5 mt-1">
      <div className={`h-5 ${baseStyle}`} style={{ width: `${percent}%` }}></div>
      <div className={`absolute top-0 left-0 w-full h-full flex justify-center items-center font-bold ${txtStyle}`}>
        {percent}%
      </div>
    </div>
  )
}

export default PercentBar