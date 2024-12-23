/*Leaderboard.tsx*/
"use client";

import React from "react";
import { NodeType } from "@/types/NetworkType";
import HelpTooltip from "./HelpTooltip";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";

type Props = {
  nodes: NodeType[];
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
};

const Leaderboard: React.FC<Props> = ({ nodes, setSelectedIndex }) => {
  // ランキング順にソート
  const sortedNodes = [...nodes].sort(
    (a, b) => (b.circleScale ?? 0) - (a.circleScale ?? 0)
  );
  // .slice(0, 20); // 上位20件

  const selectColor = (rank: number) => {
    const rankColor =
      rank === 1
        ? "text-yellow-500"
        : rank === 2
        ? "text-gray-400"
        : rank === 3
        ? "text-orange-500"
        : "text-white";
    return { rankColor };
  };

  return (
    <div className="p-4">
      <div className="flex items-center mb-4">
        <LeaderboardIcon className="text-white mr-2" />
        <h2 className="text-xl font-semibold">ランキング</h2>
        <HelpTooltip title="人気のゲームランキングです。" />
      </div>
      <ul>
        {sortedNodes.map((node, index) => (
          <li
            key={node.steamGameId}
            className="flex items-center mb-2 cursor-pointer hover:bg-gray-700 p-2 rounded"
            onClick={() => setSelectedIndex(node.index)}
          >
            <span className={`${selectColor(index + 1).rankColor} mr-2`}>
              {index + 1}位
            </span>
            <span className="text-white">{node.title}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Leaderboard;
