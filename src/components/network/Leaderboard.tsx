/*Leaderboard.tsx*/
"use client";

import React from "react";
import { NodeType } from "@/types/NetworkType";
import HelpTooltip from "./HelpTooltip";
import LeaderboardOutlinedIcon from "@mui/icons-material/LeaderboardOutlined";
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { changeGameIdData } from "@/hooks/indexedDB";

type Props = {
  nodes: NodeType[];
  selectedIndex: number;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
  userAddedGames: string[];
  setUserAddedGames: React.Dispatch<React.SetStateAction<string[]>>;
  setIsNetworkLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

const Leaderboard: React.FC<Props> = ({ nodes, selectedIndex, setSelectedIndex, userAddedGames, setUserAddedGames, setIsNetworkLoading }) => {
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
        <LeaderboardOutlinedIcon className="text-white mr-2" />
        <h2 className="text-xl font-semibold">ランキング</h2>
        <HelpTooltip title="人気のゲームランキングです。" />
      </div>
      <ul>
        {sortedNodes.map((node, index) => {
          const isUserAdded = userAddedGames.find(
            (gameId: string) => gameId === node.steamGameId
          );
          const titleColor = isUserAdded ? "green-300" : "white";
  
          const isSelected = selectedIndex === node.index; // 選択状態を判定
  
          return (
            <li
              key={node.steamGameId}
              className={`flex items-center justify-between mb-2 cursor-pointer p-2 rounded ${
                isSelected ? "bg-blue-700 text-white" : "hover:bg-gray-700"
              }`}
              onClick={() => setSelectedIndex(node.index)}
            >
              {/* ランクとタイトル */}
              <div className="flex items-center">
                <span className={`${selectColor(index + 1).rankColor} mr-2`}>
                  {index + 1}位
                </span>
                <span className={`text-${titleColor}`}>{node.title}</span>
              </div>
  
              {/* ゴミ箱アイコン */}
              {isUserAdded && (
                <div
                  className="flex items-center justify-center p-1 hover:bg-red-500 rounded cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    const newUserAddedGames = userAddedGames.filter(
                      (gameId: string) => gameId !== node.steamGameId
                    );
                    setUserAddedGames(newUserAddedGames);
                    (async () => {
                      await changeGameIdData(newUserAddedGames);
                      setIsNetworkLoading(true);
                    })();
                  }}
                >
                  <DeleteOutlineOutlinedIcon />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Leaderboard;
