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
        className={`flex-1 px-2 py-1 rounded cursor-pointer text-center ${isLeft ? 'bg-green-200 text-green-800' : 'bg-gray-400 text-green-800'} ${isUserLeft ? 'border-b-4 border-green-500' : ''}`}>
        {leftTxt}
      </span>
      <span 
        className={`flex-1 px-2 py-1 rounded cursor-pointer text-center ${isRight ? 'bg-green-200 text-green-800' : 'bg-gray-400 text-green-800'} ${isUserRight ? 'border-b-4 border-green-500' : ''}`}>
        {rightTxt}
      </span>
    </div>
  )
}

export default IsAbleBar