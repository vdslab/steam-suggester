"use client";

import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import FilterListOutlinedIcon from "@mui/icons-material/FilterListOutlined";
import LiveTvOutlinedIcon from "@mui/icons-material/LiveTvOutlined";
import SportsEsportsOutlinedIcon from "@mui/icons-material/SportsEsportsOutlined";
import LeaderboardOutlinedIcon from "@mui/icons-material/LeaderboardOutlined";
import HighlightOutlinedIcon from "@mui/icons-material/HighlightOutlined";
import TourOutlinedIcon from "@mui/icons-material/TourOutlined";
import { startsWith } from "../common/Utils";

// 共通のボタンクラス
const buttonClasses = (isActive: boolean) =>
  `w-full py-2 text-center flex flex-col items-center ${
    isActive ? "bg-gray-700" : "hover:bg-gray-700"
  } rounded transition-colors duration-200`;

const titleClasses = () => "text-xs mt-1 hidden lg:inline-block";

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
    <div className="bg-gray-800 text-white flex flex-col items-center py-4 space-y-4 z-10 w-[10vw] max-w-16 lg:w-24 lg:max-w-24">
      {/* 上部ボタン群 */}
      <div className="flex flex-col items-center space-y-4 flex-grow select-none">
        {/* ランキングボタン */}
        <button
          onClick={() => togglePanel("ranking")}
          className={`${buttonClasses(startsWith(openPanel, "ranking"))} step5`}
        >
          <LeaderboardOutlinedIcon />
          <span className={titleClasses()}>ランキング</span>
        </button>
        {/* 区切り線 */}
        <div className="w-full border-t border-gray-700 my-2"></div>
        {/* Steamリストボタン */}
        <button
          onClick={() => togglePanel("steamList")}
          className={`${buttonClasses(
            startsWith(openPanel, "steamList")
          )} step4`}
        >
          <SportsEsportsOutlinedIcon />
          <span className={titleClasses()}>Steam連携</span>
        </button>

        {/* Streamerボタン */}
        <button
          onClick={() => togglePanel("streamer")}
          className={`${buttonClasses(
            startsWith(openPanel, "streamer")
          )} step2`}
        >
          <LiveTvOutlinedIcon />
          <span className={titleClasses()}>配信者</span>
        </button>
        {/* 強調表示ボタン */}
        <button
          onClick={() => togglePanel("highlight")}
          className={`${buttonClasses(startsWith(openPanel, "highlight"))} `}
        >
          <HighlightOutlinedIcon />
          <span className={titleClasses()}>強調表示</span>
        </button>
        {/* 区切り線 */}
        <div className="w-full border-t border-gray-700 my-2"></div>
        {/* 類似度ボタン */}
        <button
          onClick={() => togglePanel("similarity")}
          className={`${buttonClasses(
            startsWith(openPanel, "similarity")
          )} step3`}
        >
          <TuneOutlinedIcon />
          <span className={titleClasses()}>類似度設定</span>
        </button>
        {/* フィルターボタン */}
        <button
          onClick={() => togglePanel("filter")}
          className={`${buttonClasses(startsWith(openPanel, "filter"))} step1`}
        >
          <FilterListOutlinedIcon />
          <span className={titleClasses()}>フィルター</span>
        </button>
      </div>

      {/* ツアーボタン */}
      <button onClick={toggleTourRun} className={`${buttonClasses(tourRun)}`}>
        <TourOutlinedIcon />
        <span className={titleClasses()}>チュートリアル</span>
      </button>
    </div>
  );
};

export default Sidebar;
