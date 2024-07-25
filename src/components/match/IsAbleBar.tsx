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
        className={`flex-1 px-2 py-1 rounded cursor-pointer text-center border-b-4 ${isUserLeft ? 'border-green-500' : isLeft ? 'border-yellow-200' : 'border-gray-400'} ${isLeft ? 'bg-yellow-200 text-yellow-800' : 'bg-gray-400 text-yellow-800'}`}>
        {leftTxt}
      </span>
      <span
        className={`flex-1 px-2 py-1 rounded cursor-pointer text-center border-b-4 ${isUserRight ? 'border-green-500' : isRight ? 'border-yellow-200' : 'border-gray-400'} ${isRight ? 'bg-yellow-200 text-yellow-800' : 'bg-gray-400 text-yellow-800'}`}>
        {rightTxt}
      </span>
    </div>
  )
}

export default IsAbleBar