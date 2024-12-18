import { NodeType } from "@/types/NetworkType";
import router from "next/router";
import Tags from "./Tags";
import Image from "next/image";
import DeleteIcon from '@mui/icons-material/Delete';


type Props = {
  node :NodeType;
  selectedIndex: number;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
  userAddedGames: string[];
  handleGameClick: (index: number) => void;
  handleGameDelete: (steamGameId: string) => void;
  selectedDetailRef: React.RefObject<HTMLDivElement>;
  anyGameSelected: boolean;
}

// ランクカラーの選択
const selectColor = (rank: number) => {
  const rankColor = rank === 1 
                  ? "text-yellow-500" 
                  : rank === 2 
                  ? "text-gray-400" 
                  : rank === 3 
                  ? "text-orange-500" 
                  : "text-white";
  return { rankColor };
}

const ListContent = (props: Props) => {

  const { node, selectedIndex, setSelectedIndex, userAddedGames, handleGameClick, handleGameDelete, selectedDetailRef, anyGameSelected } = props;

    const isSelected = selectedIndex === node.index;
    const { rankColor } = selectColor(node.index + 1);
    const isUserAdded = userAddedGames.includes(node.steamGameId);


    return (
      <div
        className={`cursor-pointer rounded-lg transform transition-all duration-300 ${
          isSelected
            ? 'bg-gray-800 border-2 shadow-xl p-2 mb-4 scale-x-105 scale-y-102'
            : 'bg-gray-900 p-2'
        } space-y-2`}
      >
        <div 
          className="flex items-center justify-between"
          onClick={() => handleGameClick(node.index)}
        >
          <div className="flex items-center">
            <div className={`${rankColor} pb-2 p-2`}>
              {node.index + 1}位
            </div>
            <div className="text-white p-2">
              {node.title}
            </div>
          </div>
          {isUserAdded && (
            <DeleteIcon 
              className='cursor-pointer hover:bg-gray-600 rounded'
              onClick={(e) => {
                e.stopPropagation(); // 親のクリックイベントを防止
                handleGameDelete(node.steamGameId);
              }}
            />
          )}
        </div>

        {/* ゲーム詳細表示部分 */}
        {isSelected && (
          <div className="mt-2" ref={selectedDetailRef}>
            <Image
              src={node.imgURL}
              alt={node.title}
              width={300}
              height={170}
              style={{
                borderRadius: "4px",
              }}
              className="object-cover"
            />
            {/* タグ表示部分 */}
            <Tags tags={node.tags} />

            {/* 価格表示 */}
            <div className="text-white mt-2">
              <strong>価格:</strong> {node.price ? `${node.price}円` : "無料"}
            </div>
            {/* アクションボタン */}
            <div className="mt-4 flex space-x-2">
              <button
                className="bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded"
                onClick={() =>
                  router.push(
                    `/desktop/details?steam_id=${node.steamGameId}&twitch_id=${node.twitchGameId}`
                  )
                }
              >
                詳細を確認
              </button>
              <button
                className="bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded"
                onClick={() => setSelectedIndex(-1)}
              >
                閉じる
              </button>
            </div>
          </div>
        )}
      </div>
  )
}

export default ListContent