/* GameList.tsx */
"use client";

import { NodeType } from "@/types/NetworkType";
import { SteamGenreType } from "@/types/api/getSteamDetailType";
import Image from "next/image";
import { useRouter } from 'next/navigation';

type Props = {
  nodes: NodeType[];
  selectedIndex: number;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
  setCenterX: React.Dispatch<React.SetStateAction<number>>;
  setCenterY: React.Dispatch<React.SetStateAction<number>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

const GameList = (props: Props) => {
  const { nodes, selectedIndex, setSelectedIndex, setCenterX, setCenterY } = props;
  const router = useRouter();

  const handleGameClick = (index: number) => {
    setCenterX(nodes[index].x ?? 0);
    setCenterY((nodes[index].y ?? 0) + 100);
    setSelectedIndex(index);
  };

  const selectColor = (index: number) => {
    const rankColor = index === 0 
                    ? "text-yellow-500" 
                    : index === 1 
                    ? "text-gray-400" 
                    : index === 2 
                    ? "text-orange-500" 
                    : "text-white";
    return { rankColor };
  }

  return (
    <div style={{ maxHeight: '92vh', overflowY: 'auto', paddingBottom: '120px' }}>
      <h2 className="text-white mb-2 p-2">ゲームリスト</h2>
      {nodes.map((node: NodeType, index: number) => {
        const isSelected = selectedIndex === index;
        const { rankColor } = selectColor(index);
        return (
          <div
            key={node.index}
            className={`cursor-pointer p-2 mb-2 ${isSelected ? 'bg-gray-700' : 'bg-gray-800'} rounded-lg`}
            onClick={() => handleGameClick(index)}
          >
            <div className="flex items-center">
              <div className={`${rankColor} pb-2 p-2`}>
                {index + 1}位
              </div>
              <div className="text-white p-2">
                {node.title}
              </div>
            </div>
            {isSelected && (
              <div className="mt-2">
                <Image
                  src={node.imgURL}
                  alt={node.title}
                  width={300}
                  height={170}
                  style={{
                    borderRadius: "4px",
                  }}
                />
                <div className="text-white mt-2">
                  <strong>タグ:</strong> {node.genres?.map((item: SteamGenreType) => item.description).join(", ") || "No tags"}
                </div>
                <div className="text-white mt-2">
                  <strong>価格:</strong> {node.price ? `${node.price}円` : "無料"}
                </div>
                <div className="mt-4">
                  <button
                    className="bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded"
                    onClick={() =>
                      router.push(
                        `/desktop/details?steam_id=${node.steamGameId}&twitch_id=${node.twitchGameId}`
                      )
                    }
                  >
                    詳細を確認する
                  </button>
                  <button
                    className="ml-2 bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded"
                    onClick={() => setSelectedIndex(-1)}
                  >
                    閉じる
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default GameList;
