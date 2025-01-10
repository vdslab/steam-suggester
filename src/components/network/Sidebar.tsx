"use client";

import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import FilterListOutlinedIcon from "@mui/icons-material/FilterListOutlined";
import LiveTvOutlinedIcon from "@mui/icons-material/LiveTvOutlined";
import SportsEsportsOutlinedIcon from "@mui/icons-material/SportsEsportsOutlined";
import LeaderboardOutlinedIcon from "@mui/icons-material/LeaderboardOutlined";
import HighlightOutlinedIcon from "@mui/icons-material/HighlightOutlined";
import TourOutlinedIcon from "@mui/icons-material/TourOutlined";

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
      <div className="flex flex-col items-center space-y-4 flex-grow select-none">
        {/* ランキングボタン */}
        <button
          onClick={() => togglePanel("ranking")}
          className={`${buttonClasses(openPanel === "ranking")} step5`}
        >
          <LeaderboardOutlinedIcon />
          <span className="text-xs mt-1">ランキング</span>
        </button>
        {/* 区切り線 */}
        <div className="w-full border-t border-gray-700 my-2"></div>
        {/* Steamリストボタン */}
        <button
          onClick={() => togglePanel("steamList")}
          className={`${buttonClasses(openPanel === "steamList")} step4`}
        >
          <SportsEsportsOutlinedIcon />
          <span className="text-xs mt-1">Steam連携</span>
        </button>
        {/* 強調表示ボタン */}
        <button
          onClick={() => togglePanel("highlight")}
          className={`${buttonClasses(openPanel === "highlight")} `}
        >
          <HighlightOutlinedIcon />
          <span className="text-xs mt-1">強調表示</span>
        </button>
        {/* Streamerボタン */}
        <button
          onClick={() => togglePanel("streamer")}
          className={`${buttonClasses(openPanel === "streamer")} step2`}
        >
          <LiveTvOutlinedIcon />
          <span className="text-xs mt-1">配信者</span>
        </button>
        {/* 類似度ボタン */}
        <button
          onClick={() => togglePanel("similarity")}
          className={`${buttonClasses(openPanel === "similarity")} step3`}
        >
          <TuneOutlinedIcon />
          <span className="text-xs mt-1">類似度設定</span>
        </button>
        {/* フィルターボタン */}
        <button
          onClick={() => togglePanel("filter")}
          className={`${buttonClasses(openPanel === "filter")} step1`}
        >
          <FilterListOutlinedIcon />
          <span className="text-xs mt-1">フィルター</span>
        </button>
      </div>

      {/* ツアーボタン */}
      <button onClick={toggleTourRun} className={`${buttonClasses(tourRun)}`}>
        <TourOutlinedIcon />
        <span className="text-xs mt-1">ツアー開始</span>
      </button>
    </div>
  );
};

export default Sidebar;
