import React from 'react'

type Props = {
  isLeft: boolean,
  isRight: boolean,
  isUserRight: boolean,
  isUserLeft: boolean,
  leftTxt: string,
  rightTxt: string,
}

const IsAbleBar = (props:Props) => {

  const { isLeft, isRight, isUserRight, isUserLeft, leftTxt, rightTxt } = props;

  return (
    <div className="flex">
      <span
        className={`flex-1 px-2 py-1 cursor-default rounded text-center border-4  ${isUserLeft ? 'border-blue-500' : isLeft ? 'border-[#9684fc]' : 'border-blue-500'} ${isLeft ? 'bg-[#9684fc] text-blue-100' : 'bg-gray-400 text-blue-900'}`}>
        {leftTxt}
      </span>
      <span
        className={`flex-1 px-2 py-1 cursor-default rounded text-center border-4 ${isUserRight ? 'border-blue-500' : isRight ? 'border-[#9684fc]' : 'border-blue-500'} ${isRight ? 'bg-[#9684fc] text-blue-100' : 'bg-gray-400 text-blue-900'}`}>
        {rightTxt}
      </span>
      {/* <span
        className={`flex-1 px-2 py-1 cursor-default rounded text-center ${isLeft ? 'bg-blue-400 text-blue-800' : 'bg-gray-400 text-gray-100'}`}>
        {leftTxt}
      </span>
      <span
        className={`flex-1 px-2 py-1 cursor-default rounded text-center ${isRight ? 'bg-blue-400 text-blue-800' : 'bg-gray-400 text-gray-100'}`}>
        {rightTxt}
      </span> */}
    </div>
  )
}

export default IsAbleBar