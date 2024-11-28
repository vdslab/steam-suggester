/* Sidebar.tsx */
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

const Sidebar = ({
  isFilterOpen,
  toggleFilter,
  isChatOpen,
  toggleChat,
  isGameListOpen,
  toggleGameList,
}: Props) => {
  return (
    <div className="w-16 bg-stone-800 flex flex-col items-center py-4 space-y-4">
      <button
        onClick={toggleFilter}
        className={`w-full py-2 text-white ${isFilterOpen ? "bg-stone-700" : "hover:bg-stone-700"}`}
      >
        フィルター
      </button>
      <button
        onClick={toggleChat}
        className={`w-full py-2 text-white ${isChatOpen ? "bg-stone-700" : "hover:bg-stone-700"}`}
      >
        チャット
      </button>
      <button
        onClick={toggleGameList}
        className={`w-full py-2 text-white ${isGameListOpen ? "bg-stone-700" : "hover:bg-stone-700"}`}
      >
        ゲームリスト
      </button>
    </div>
  );
};

export default Sidebar;
