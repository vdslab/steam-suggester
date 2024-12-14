import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { green, yellow, red } from '@mui/material/colors';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';

type Props = {
  label: string;
  value: number;
  children?: React.ReactNode;
};

const ScoreCard: React.FC<Props> = ({ label, value, children }) => {
  // 一致度に応じた色とアイコンを設定
  let color: string = green[500];
  let Icon = CheckCircleIcon;

  if (value < 50) {
    color = red[500];
    Icon = ErrorIcon;
  } else if (value < 80) {
    color = yellow[700];
    Icon = WarningIcon;
  }

  return (
    <Card style={{ borderTop: `5px solid ${color}`, width: '100%' }} className="shadow-lg">
      <CardContent className="flex flex-col items-center">
        <Icon style={{ color: color, fontSize: 40 }} />
        <Typography variant="h5" component="div" className="mt-2">
          {value}%
        </Typography>
        <Typography color="textSecondary">
          {label}
        </Typography>
        {children && <div className="mt-2">{children}</div>}
      </CardContent>
    </Card>
  );
};

export default ScoreCard;
