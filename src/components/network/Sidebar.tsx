/*Sidebar.tsx*/
"use client";

import React from "react";
import FilterListIcon from "@mui/icons-material/FilterList";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import LiveTvIcon from "@mui/icons-material/LiveTv";
import TourIcon from "@mui/icons-material/Tour";
import TuneIcon from "@mui/icons-material/Tune";
import LeaderboardIcon from "@mui/icons-material/Leaderboard"; // ランキング用アイコンの追加

// 共通のボタンクラス
export const buttonClasses = (isActive: boolean) =>
  `w-full py-2 text-center flex flex-col items-center ${
    isActive ? "bg-gray-700" : "hover:bg-gray-700"
  } rounded transition-colors duration-200`;

type Props = {
  openPanel: string | null;
  togglePanel: (panelName: string) => void;
  tourRun: boolean;
  toggleTourRun: () => void;
};

const Sidebar: React.FC<Props> = ({
  openPanel,
  togglePanel,
  tourRun,
  toggleTourRun,
}) => {
  return (
    <div className="w-24 bg-gray-800 text-white flex flex-col items-center py-4 space-y-4 z-10">
      {/* 上部ボタン群 */}
      <div className="flex flex-col items-center space-y-4 flex-grow">
        {" "}
        {/* 類似度ボタン */}
        <button
          onClick={() => togglePanel("similarity")}
          className={`${buttonClasses(openPanel === "similarity")} step3`}
        >
          <TuneIcon />
          <span className="text-xs mt-1">類似度設定</span>
        </button>
        {/* フィルターボタン */}
        <button
          onClick={() => togglePanel("filter")}
          className={`${buttonClasses(openPanel === "filter")} step1`}
        >
          <FilterListIcon />
          <span className="text-xs mt-1">フィルター</span>
        </button>
        {/* Streamerボタン */}
        <button
          onClick={() => togglePanel("streamer")}
          className={`${buttonClasses(openPanel === "streamer")} step2`}
        >
          <LiveTvIcon />
          <span className="text-xs mt-1">配信者</span>
        </button>
        {/* Steamリストボタン */}
        <button
          onClick={() => togglePanel("steamList")}
          className={`${buttonClasses(openPanel === "steamList")} step4`}
        >
          <SportsEsportsIcon />
          <span className="text-xs mt-1">Steam連携</span>
        </button>
        {/* ランキングボタン */}
        <button
          onClick={() => togglePanel("ranking")}
          className={`${buttonClasses(openPanel === "ranking")} step5`}
        >
          <LeaderboardIcon />
          <span className="text-xs mt-1">ランキング</span>
        </button>
      </div>

      {/* ツアーボタン */}
      <button onClick={toggleTourRun} className={`${buttonClasses(tourRun)}`}>
        <TourIcon />
        <span className="text-xs mt-1">ツアー開始</span>
      </button>
    </div>
  );
};

export default Sidebar;
