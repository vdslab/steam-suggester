/*MatchIndicator.tsx*/
import React from 'react';
import Tooltip from '@mui/material/Tooltip';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';

type Props = {
  matchScore: number;
};

const MatchIndicator: React.FC<Props> = ({ matchScore }) => {
  let color = "green";
  let Icon = CheckCircleIcon;
  let message = "非常に一致しています";

  if (matchScore < 50) {
    color = "red";
    Icon = ErrorIcon;
    message = "一致していません";
  } else if (matchScore < 80) {
    color = "yellow";
    Icon = WarningIcon;
    message = "適度に一致しています";
  }

  return (
    <div className="flex items-center">
      <Tooltip title={message}>
        <Icon style={{ color: color, fontSize: 40, marginRight: '1rem' }} />
      </Tooltip>
      <div>
        <div className="text-lg text-white">一致度: {matchScore}%</div>
        <div className="text-sm text-gray-300">{message}</div>
      </div>
    </div>
  );
};

export default MatchIndicator;
