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
  return (
    <div className="w-24 bg-gray-800 text-white flex flex-col items-center py-4 space-y-4">
      {/* フィルター ボタン */}
      <button
        onClick={toggleFilter}
        className={`w-full py-2 text-center flex flex-col items-center ${
          isFilterOpen ? "bg-gray-700" : "hover:bg-gray-700"
        } rounded`}
      >
        <FilterListIcon />
        <span className="text-xs mt-1">フィルター</span>
      </button>

      {/* ゲームリスト ボタン */}
      <button
        onClick={toggleGameList}
        className={`w-full py-2 text-center flex flex-col items-center ${
          isGameListOpen ? "bg-gray-700" : "hover:bg-gray-700"
        } rounded`}
      >
        <SportsEsportsIcon />
        <span className="text-xs mt-1">ゲームリスト</span>
      </button>

      {/* 強調 ボタン */}
      <button
        onClick={toggleEmphasis}
        className={`w-full py-2 text-center flex flex-col items-center ${
          isEmphasisOpen ? "bg-gray-700" : "hover:bg-gray-700"
        } rounded`}
      >
        <HighlightIcon />
        <span className="text-xs mt-1">強調</span>
        <span className="text-[10px] text-gray-400">（チャット & 配信者）</span>
      </button>
    </div>
  );
};

export default Sidebar;
