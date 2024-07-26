import React from 'react'

type Props = {
  isLeft: boolean,
  isRight: boolean,
  isUserRight: boolean,
  isUserLeft: boolean,
  leftTxt: string,
  rightTxt: string,
}

const IsAbleBar = (props: Props) => {
  const { isLeft, isRight, isUserRight, isUserLeft, leftTxt, rightTxt } = props;

  const leftStyle = `${isLeft ? 'bg-green-300 text-gray-900' : 'bg-gray-400 text-gray-900'} ${isUserLeft ? 'underline decoration-blue-600' : ''}`;
  const rightStyle = `${isRight ? 'bg-green-300 text-gray-900' : 'bg-gray-400 text-gray-900'}  ${isUserRight ? 'underline decoration-blue-600' : ''}`;

  return (
    <div className="flex">
      <span className={`flex-1 px-2 py-1 rounded text-center ${leftStyle}`}>
        {leftTxt}
      </span>
      <span className={`flex-1 px-2 py-1 rounded text-center ${rightStyle}`}>
        {rightTxt}
      </span>
    </div>
  );
};

export default IsAbleBar