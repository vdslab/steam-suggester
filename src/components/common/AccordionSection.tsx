'use client';

import React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

type AccordionSectionProps = {
  title: string;
  children: React.ReactNode;
};

const AccordionSection: React.FC<AccordionSectionProps> = ({ title, children }) => {
  return (
    <Accordion className="bg-gray-700 rounded-lg overflow-hidden border border-gray-400">
      <AccordionSummary
        expandIcon={<ExpandMoreIcon className="text-white" />}
        aria-controls={`${title}-content`}
        id={`${title}-header`}
      >
        <Typography className="text-white font-semibold">{title}</Typography>
      </AccordionSummary>
      <AccordionDetails className="bg-gray-700">
        {children}
      </AccordionDetails>
    </Accordion>
  );
};

export default AccordionSection;
