/* Sidebar.tsx */
"use client";

import React from "react";
import FilterListIcon from '@mui/icons-material/FilterList';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import LiveTvIcon from "@mui/icons-material/LiveTv";
import TourIcon from '@mui/icons-material/Tour';
import TuneIcon from "@mui/icons-material/Tune";

type Props = {
  openPanel: string | null;
  togglePanel: (panelName:string) => void;
  tourRun: boolean;
  toggleTourRun: () => void;
};


const Sidebar: React.FC<Props> = ({
  openPanel,
  togglePanel,
  tourRun,
  toggleTourRun

}) => {
  // 共通のボタンクラス
  const buttonClasses = (isActive: boolean) =>
    `w-full py-2 text-center flex flex-col items-center ${
      isActive ? "bg-gray-700" : "hover:bg-gray-700"
    } rounded transition-colors duration-200`;

  return (
    <div className="w-24 bg-gray-800 text-white flex flex-col items-center py-4 space-y-4">
      {/* 類似度ボタン */}
      <button
        onClick={() => togglePanel("similarity")}
        className={`${buttonClasses(openPanel == "similarity")} step3`}
      >
        <TuneIcon />
        <span className="text-xs mt-1">類似度設定</span>
      </button>

      {/* フィルターボタン */}
      <button
        onClick={() => togglePanel("filter")}
        className={`${buttonClasses(openPanel == "filter")} step1`}
      >
        <FilterListIcon />
        <span className="text-xs mt-1">フィルター</span>
      </button>

      {/* Streamerボタン */}
      <button
        onClick={() => togglePanel("streamer")}
        className={`${buttonClasses(openPanel == "streamer")} step2`}
      >
        <LiveTvIcon />
        <span className="text-xs mt-1">配信者</span>
      </button>

      {/* Steamリストボタン */}
      <button
        onClick={() => togglePanel("steamList")}
        className={`${buttonClasses(openPanel == "steamList")} step4`}
      >
        <SportsEsportsIcon />
        <span className="text-xs mt-1">Steam連携</span>
      </button>

      {/* ツアーボタン */}
      <button
        onClick={toggleTourRun}
        className={`${buttonClasses(tourRun)}`}
      >
        <TourIcon />
        <span className="text-xs mt-1">ツアー開始</span>
      </button>


    </div>
  );
};

export default Sidebar;
