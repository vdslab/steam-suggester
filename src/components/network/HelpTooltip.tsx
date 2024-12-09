import React from "react";
import Tooltip from "@mui/material/Tooltip";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

type Props = {
  title: string;
  className?: string;
};

const HelpTooltip: React.FC<Props> = ({ title, className }) => {
  return (
    <Tooltip title={title} arrow>
      <HelpOutlineIcon className={`text-gray-400 ml-2 ${className}`} style={{ cursor: "pointer" }} />
    </Tooltip>
  );
};

export default HelpTooltip;
