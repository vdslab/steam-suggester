'use client';

import { useState } from "react";
import { Box, Modal, Typography, Stepper, Step, StepLabel, Button } from "@mui/material";

type Props = {
  run: boolean;
  setRun: React.Dispatch<React.SetStateAction<boolean>>;
};

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const steps = [
  'Step 1: Introduction',
  'Step 2: Details',
  'Step 3: Confirmation',
];

const Tutorial = (props: Props) => {
  const { run, setRun } = props;
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleClose = () => {
    setRun(false);
    setActiveStep(0); // モーダルを閉じたときにステップをリセット
  };

  return (
    <Modal
      open={run}
      onClose={handleClose}
    >
      <Box sx={style}>
        <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ mb: 2 }}>
          {steps[activeStep]}
        </Typography>

        {/* ステップの説明 */}
        <Typography id="modal-modal-description" sx={{ mb: 4 }}>
          {activeStep === 0 && "Welcome to the tutorial. Here we explain the basics."}
          {activeStep === 1 && "This is the detailed explanation step."}
          {activeStep === 2 && "Please confirm and complete the tutorial."}
        </Typography>

        {/* ステッパー */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label, index) => (
            <Step key={index}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* ボタン */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Back
          </Button>
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleClose}
            >
              Finish
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
            >
              Next
            </Button>
          )}
        </Box>
      </Box>
    </Modal>
  );
};

export default Tutorial;
