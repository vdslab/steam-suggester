"use client";

import { useState } from "react";
import {
  Box,
  Modal,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
} from "@mui/material";
import useScreenSize from "@visx/responsive/lib/hooks/useScreenSize";

type Props = {
  run: boolean;
  setRun: React.Dispatch<React.SetStateAction<boolean>>;
};


const steps = [
  "Step 1: 気になるゲームを選択しよう",
  "Step 2: さらに気になるゲームを探そう",
  "Step 3: ゲーム詳細情報",
];

const stepLabels = ["Step 1", "Step 2", "Step 3"];

const stepImages = [
  `${process.env.NEXT_PUBLIC_CURRENT_URL}/tutorialImg/1.gif`,
  `${process.env.NEXT_PUBLIC_CURRENT_URL}/tutorialImg/2.gif`,
  `${process.env.NEXT_PUBLIC_CURRENT_URL}/tutorialImg/3.jpg`,
];

const stepImagesMobile = [
  `${process.env.NEXT_PUBLIC_CURRENT_URL}/tutorialImg/sp1.gif`,
  `${process.env.NEXT_PUBLIC_CURRENT_URL}/tutorialImg/sp2.gif`,
];

const stepDescriptions = [
  "画像ホバーすると、ゲーム情報が表示される",
  "数値をホバーすると、選択されているゲームとの関連度が表示される",
  "ゲームの詳細情報画面も駆使してゲームを探そう！",
];

const Tutorial = ({ run, setRun }: Props) => {
  const [activeStep, setActiveStep] = useState(0);

  const { width, height } = useScreenSize({ debounceTime: 150 });

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: `${width < 640 ? "70%" : "50%"}`,
    bgcolor: "#121212",
    color: "#ffffff",
    borderRadius: "12px",
    border: "1px solid #ffffff",
    boxShadow: 10,
    p: 4,
    textAlign: "center",
  };
  

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);
  const handleClose = () => {
    setRun(false);
    setActiveStep(0);
  };

  return (
    <Modal open={run} onClose={handleClose}>
      <Box sx={style}>
        {/* ステップタイトル */}
        <Typography
          variant="h6"
          component="h2"
          sx={{ mb: 2, fontWeight: "bold" }}
        >
          {steps[activeStep]}
        </Typography>

        {/* ステップ説明 */}
        {width >= 1024 && (
          <Typography sx={{ mb: 2, color: "#bbbbbb" }}>
            {stepDescriptions[activeStep]}
          </Typography>
        )}

        {/* ステップ画像 */}
        <Box sx={{ mb: 3, display: "flex", justifyContent: "center" }}>
          <img
            src={width < 1024 ?  stepImagesMobile[activeStep] :stepImages[activeStep]}
            alt={`Step ${activeStep + 1}`}
            style={{
              width: "100%",
              height: "auto",
              borderRadius: "8px",
              border: "1px solid #ddd",
              boxShadow: "2px 2px 10px rgba(0, 0, 0, 0.1)",
            }}
          />
        </Box>

        {/* ステッパー */}
        {width >= 1024 &&
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {stepLabels.map((label, index) => (
            <Step key={index}>
              <StepLabel
                sx={{
                  color: "white",
                  "& .MuiStepLabel-label": { color: "white" },
                  "& .MuiStepLabel-label.Mui-active": { color: "white" },
                  "& .MuiStepLabel-label.Mui-completed": { color: "white" },
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
        }

        {/* ボタン */}
        <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
          <Button
            variant="outlined"
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            戻る
          </Button>
          {activeStep === steps.length - 1 ? (
            <Button variant="contained" color="primary" onClick={handleClose}>
              閉じる
            </Button>
          ) : (
            <Button variant="contained" color="primary" onClick={handleNext}>
              次へ
            </Button>
          )}
        </Box>
      </Box>
    </Modal>
  );
};

export default Tutorial;
