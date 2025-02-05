"use client";

import React, { useEffect, useState } from "react";
import { NodeType } from "@/types/NetworkType";
import HelpTooltip from "../../common/HelpTooltip";
import LeaderboardOutlinedIcon from "@mui/icons-material/LeaderboardOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { changeGameIdData, getGameIdData } from "@/hooks/indexedDB";

type Props = {
  nodes: NodeType[];
  selectedIndex: number;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
  setIsNetworkLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

const Leaderboard: React.FC<Props> = ({
  nodes,
  selectedIndex,
  setSelectedIndex,
  setIsNetworkLoading,
}) => {

  const [addedGameIds, setAddedGameIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchGameIds = async () => {
      const addedGameIds = await getGameIdData();
      setAddedGameIds(addedGameIds ?? []);
    };
    fetchGameIds();
  }, [nodes]);


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
        <HelpTooltip title="Steamのアクティブユーザー数ランキングを表示します。新しく追加されたゲームタイトルは色付きで表示されます。" />
      </div>
      <ul>
        {sortedNodes.map((node, index) => {
          const isUserAdded = addedGameIds.find((gameId: string) => gameId === node.steamGameId);
          const titleColor = isUserAdded ? "text-green-300" : "text-white";

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
                <span className={`${titleColor}`}>{node.title}</span>
              </div>

              {/* ゴミ箱アイコン */}
              {isUserAdded && (
                <div
                  className="flex items-center justify-center p-1 hover:bg-red-500 rounded cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    const newUserAddedGames = addedGameIds.filter(
                      (gameId: string) => gameId !== node.steamGameId
                    );
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
