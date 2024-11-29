/* Sidebar.tsx */
"use client";

import React from "react";
import FilterListIcon from '@mui/icons-material/FilterList';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import ChatIcon from "@mui/icons-material/Chat";
import LiveTvIcon from "@mui/icons-material/LiveTv";

type Props = {
  isFilterOpen: boolean;
  toggleFilter: () => void;
  isStreamerOpen: boolean;
  toggleStreamer: () => void;
  isChatOpen: boolean;
  toggleChat: () => void;
  isSteamListOpen: boolean;
  toggleSteamList: () => void;
};


const Sidebar: React.FC<Props> = ({
  isFilterOpen,
  toggleFilter,
  isStreamerOpen,
  toggleStreamer,
  isChatOpen,
  toggleChat,
  isSteamListOpen,
  toggleSteamList
}) => {
  // 共通のボタンクラス
  const buttonClasses = (isActive: boolean) =>
    `w-full py-2 text-center flex flex-col items-center ${
      isActive ? "bg-gray-700" : "hover:bg-gray-700"
    } rounded transition-colors duration-200`;

  return (
    <div className="w-24 bg-gray-800 text-white flex flex-col items-center py-4 space-y-4">
      {/* フィルターボタン */}
      <button
        onClick={toggleFilter}
        className={buttonClasses(isFilterOpen)}
      >
        <FilterListIcon />
        <span className="text-xs mt-1">フィルター</span>
      </button>

      {/* Streamerボタン */}
      <button
        onClick={toggleStreamer}
        className={buttonClasses(isStreamerOpen)}
      >
        <LiveTvIcon />
        <span className="text-xs mt-1">配信者</span>
      </button>

      {/* ChatBarボタン */}
      <button
        onClick={toggleChat}
        className={buttonClasses(isChatOpen)}
      >
        <ChatIcon />
        <span className="text-xs mt-1">チャット</span>
      </button>

      {/* Steamリストボタン */}
      <button
        onClick={toggleSteamList}
        className={buttonClasses(isSteamListOpen)}
      >
        <SportsEsportsIcon />
        <span className="text-xs mt-1">Steam連携</span>
        <span className="text-[10px] text-gray-400">（ログイン & フレンド）</span>
      </button>
    </div>
  );
};

export default Sidebar;
