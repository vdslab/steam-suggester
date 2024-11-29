/* Sidebar.tsx */
"use client";

import React from "react";
import FilterListIcon from '@mui/icons-material/FilterList';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import HighlightIcon from '@mui/icons-material/Highlight';

type Props = {
  isFilterOpen: boolean;
  toggleFilter: () => void;
  isGameListOpen: boolean;
  toggleGameList: () => void;
  isEmphasisOpen: boolean;
  toggleEmphasis: () => void;
};

const Sidebar: React.FC<Props> = ({
  isFilterOpen,
  toggleFilter,
  isGameListOpen,
  toggleGameList,
  isEmphasisOpen,
  toggleEmphasis,
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

      {/* ゲームリストボタン */}
      <button
        onClick={toggleGameList}
        className={buttonClasses(isGameListOpen)}
      >
        <SportsEsportsIcon />
        <span className="text-xs mt-1">ゲームリスト</span>
        <span className="text-[10px] text-gray-400">（ゲーム一覧 & 検索）</span>
      </button>

      {/* 強調ボタン */}
      <button
        onClick={toggleEmphasis}
        className={buttonClasses(isEmphasisOpen)}
      >
        <HighlightIcon />
        <span className="text-xs mt-1">強調</span>
        <span className="text-[10px] text-gray-400">（チャット & 配信者）</span>
      </button>
    </div>
  );
};

export default Sidebar;
