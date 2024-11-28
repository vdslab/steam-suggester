"use client";

import React from "react";

type Props = {
  isFilterOpen: boolean;
  toggleFilter: () => void;
  isChatOpen: boolean;
  toggleChat: () => void;
  isGameListOpen: boolean;
  toggleGameList: () => void;
};

const Sidebar: React.FC<Props> = ({
  isFilterOpen,
  toggleFilter,
  isChatOpen,
  toggleChat,
  isGameListOpen,
  toggleGameList,
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
        onClick={toggleChat}
        className={`w-full py-2 text-center ${
          isChatOpen ? "bg-gray-700" : "hover:bg-gray-700"
        } rounded`}
      >
        チャット
      </button>
      <button
        onClick={toggleGameList}
        className={`w-full py-2 text-center ${
          isGameListOpen ? "bg-gray-700" : "hover:bg-gray-700"
        } rounded`}
      >
        ゲームリスト
      </button>
    </div>
  );
};

export default Sidebar;
