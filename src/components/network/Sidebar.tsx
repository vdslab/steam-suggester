/* Sidebar.tsx */
"use client";

import { useState } from "react";

type Props = {
  onToggleFilter: () => void;
  onToggleChat: () => void;
  onToggleGameList: () => void;
  isFilterOpen: boolean;
  isChatOpen: boolean;
  isGameListOpen: boolean;
};

const Sidebar = ({
  onToggleFilter,
  onToggleChat,
  onToggleGameList,
  isFilterOpen,
  isChatOpen,
  isGameListOpen,
}: Props) => {
  return (
    <div className="w-16 bg-stone-800 flex flex-col items-center py-4 space-y-4">
      {/* Filter Button */}
      <button
        onClick={onToggleFilter}
        className={`w-full text-white py-2 px-4 rounded ${
          isFilterOpen ? "bg-green-600" : "hover:bg-green-500"
        }`}
      >
        Filter
      </button>

      {/* Chat Button */}
      <button
        onClick={onToggleChat}
        className={`w-full text-white py-2 px-4 rounded ${
          isChatOpen ? "bg-blue-600" : "hover:bg-blue-500"
        }`}
      >
        Chat
      </button>

      {/* Game List Button */}
      <button
        onClick={onToggleGameList}
        className={`w-full text-white py-2 px-4 rounded ${
          isGameListOpen ? "bg-purple-600" : "hover:bg-purple-500"
        }`}
      >
        Game List
      </button>
    </div>
  );
};

export default Sidebar;
