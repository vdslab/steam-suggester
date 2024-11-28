/* Sidebar.tsx */
"use client";

import React from "react";

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
      <button
        onClick={toggleFilter}
        className={`w-full py-2 text-center ${
          isFilterOpen ? "bg-gray-700" : "hover:bg-gray-700"
        } rounded`}
      >
        フィルター
      </button>
      <button
        onClick={toggleGameList}
        className={`w-full py-2 text-center ${
          isGameListOpen ? "bg-gray-700" : "hover:bg-gray-700"
        } rounded`}
      >
        ゲームリスト
      </button>
      <button
        onClick={toggleEmphasis}
        className={`w-full py-2 text-center ${
          isEmphasisOpen ? "bg-gray-700" : "hover:bg-gray-700"
        } rounded`}
      >
        強調
      </button>
    </div>
  );
};

export default Sidebar;
