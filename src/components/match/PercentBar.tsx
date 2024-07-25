import React from 'react'

type Props = {
  baseStyle: string,
  txtStyle: string,
  percent: number
}

const PercentBar = (props:Props) => {

  const { baseStyle, txtStyle, percent } = props;

  return (
    <div className="w-full bg-gray-300 rounded-lg h-8 relative">
      <div className={`h-8 ${baseStyle}`} style={{ width: `${percent}%` }}></div>
      <div className={`absolute top-0 left-0 w-full h-full flex justify-center items-center text-lg font-bold ${txtStyle}`}>
        {percent}%
      </div>
    </div>
  )
}

export default PercentBar