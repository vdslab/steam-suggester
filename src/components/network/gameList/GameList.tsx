/* GameList.tsx */
"use client";

import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import { ISR_FETCH_INTERVAL } from "@/constants/DetailsConstants";
import { changeGameIdData, getGameIdData } from "@/hooks/indexedDB";
import { NodeType, SteamListType } from "@/types/NetworkType";
import { useEffect, useState } from "react";
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
  const { nodes, selectedIndex, setSelectedIndex, setCenterX, setCenterY, setIsLoading } = props;
  const router = useRouter();

  const [steamList, setSteamList] = useState<SteamListType[]>([]);
  const [searchSteamQuery, setSearchSteamQuery] = useState<string>('');
  const [userAddedGames, setUserAddedGames] = useState<string[]>([]);
  const [filteredSteamList, setFilteredSteamList] = useState<SteamListType[]>([]);

  const selectColor = (index: number, flag: boolean) => {
    const textColor = flag ? "text-yellow-300" : "text-slate-100";
    const rankColor = index === 0 
                    ? "text-yellow-500" 
                    : index === 1 
                    ? "text-gray-400" 
                    : index === 2 
                    ? "text-orange-500" 
                    : "text-white";
    return { textColor, rankColor };
  }

  const handleGameClick = (index: number) => {
    setCenterX(nodes[index].x ?? 0);
    setCenterY((nodes[index].y ?? 0) + 100);
    setSelectedIndex(index);
  };

  const handleGameDelete = (steamGameId: string) => {
    const newUserAddedGames = userAddedGames.filter((gameId: string) => gameId !== steamGameId);
    setUserAddedGames(newUserAddedGames);
    changeGameIdData(newUserAddedGames);
    handleGameClick(0);
    setIsLoading(true);
  }

  const handleSearchClick = (steamGameId: string) => {
    if(!userAddedGames.includes(steamGameId)) {
      const index = nodes.findIndex((node: NodeType) => node.steamGameId === steamGameId);
      if(index !== -1) handleGameClick(index);
      const newUserAddedGames = [...userAddedGames, steamGameId];
      setUserAddedGames(newUserAddedGames);
      changeGameIdData(newUserAddedGames);
      setIsLoading(true);
    }
  };

  const handleAddGame = () => {
    // ゲーム追加機能の実装（例：モーダルを開く）
    alert("ゲーム追加機能を実装してください。");
  }

  useEffect(() => {
    (async () => {
      const res1 = await fetch(
        `${process.env.NEXT_PUBLIC_CURRENT_URL}/api/network/getSteamList`,
        { next: { revalidate: ISR_FETCH_INTERVAL } }
      );
      if(!res1.ok) {
        console.error("Failed to fetch Steam list:", res1.statusText);
        return;
      }
      const data = await res1.json();
      const res2 = await getGameIdData();

      setSteamList(data);
      setFilteredSteamList(data);
      setUserAddedGames(res2 ?? []);
    })();
  }, []);

  useEffect(() => {
    if(searchSteamQuery === '') {
      setFilteredSteamList(steamList);
    } else {
      const filteredList = steamList
        .filter((game) =>
          game.title.toLowerCase().includes(searchSteamQuery.toLowerCase())
        )
        .filter((game) => !userAddedGames.includes(game.steamGameId));
      setFilteredSteamList(filteredList);
    }
  }, [steamList, searchSteamQuery, userAddedGames]);

  // ゲームリストをノードの順位順にソート
  const sortedNodes = [...nodes].sort((a, b) => {
    return (a.circleScale ?? 0) - (b.circleScale ?? 0);
  });

  return (
    <div style={{ maxHeight: '92vh', overflowY: 'auto', paddingBottom: '120px' }}>
      
      {/* ゲーム追加ボタンと検索フォーム */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handleAddGame}
          className="flex items-center bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded"
        >
          <PlaylistAddIcon className="mr-2" />
          ゲーム追加
        </button>
        <input
          type="text"
          placeholder="ゲームを検索"
          value={searchSteamQuery}
          onChange={(e) => setSearchSteamQuery(e.target.value)}
          className="w-1/2 p-2 text-black rounded"
        />
      </div>

      {/* ユーザー追加ゲーム */}
      <div className="bg-gray-800 p-2 rounded-lg mb-4">
        <h2 className="text-white mb-2">ユーザー追加ゲーム</h2>
        {userAddedGames.slice().sort((gameId1: string, gameId2: string) => {
            const index1 = nodes.findIndex((node: NodeType) => node.steamGameId === gameId1);
            const index2 = nodes.findIndex((node: NodeType) => node.steamGameId === gameId2);
            if(index1 === -1) return 1;
            if(index2 === -1) return -1;
            return index1 - index2;
          }).map((gameId) => {
          const nodeIndex = nodes.findIndex((node: NodeType) => node.steamGameId === gameId);
          const game = steamList.find(game => game.steamGameId === gameId);
          const isInNodes = nodeIndex >= 0;
          const { textColor, rankColor } = selectColor(nodeIndex, isInNodes);
          return game ? (
            <div className='flex pb-2 justify-between items-center' key={game.steamGameId}>
              <div className='flex items-center'>
                <div className={`${rankColor} pb-2 p-2`}>
                  {nodeIndex >= 0 && nodeIndex + 1}位
                </div>
                <div className={`${textColor} p-2 rounded`}>
                  {isInNodes ? <div 
                    className='cursor-pointer'
                    onClick={() => handleGameClick(nodeIndex)}
                  >
                    {game.title}
                  </div> : <div
                    className='text-slate-400'
                  >
                    {game.title}
                  </div>}
                </div>
              </div>
              <DeleteIcon 
                className='cursor-pointer hover:bg-gray-700 rounded'
                onClick={() => handleGameDelete(game.steamGameId)}
              />
            </div>
          ) : null;
        })}
      </div>

      {/* ノードのネットワークからのゲームリスト */}
      <h2 className="text-white mb-2">ネットワークノード</h2>
      {sortedNodes.map((node: NodeType, index: number) => {
        const isUserAdded = userAddedGames.includes(node.steamGameId);
        const isSelected = selectedIndex === index;
        const { textColor, rankColor } = selectColor(index, isUserAdded);
        return (
          <div key={node.index} className="mb-2">
            <div
              className={`flex items-center p-2 rounded-lg cursor-pointer ${isSelected ? 'bg-gray-700' : 'bg-gray-800 hover:bg-gray-700'}`}
              onClick={() => handleGameClick(index)}
            >
              <div className={`${rankColor} pb-2 p-2`}>
                {index + 1}位
              </div>
              <div className={`${textColor} p-2 rounded`}>
                {node.title}
              </div>
            </div>
            {isSelected && (
              <div className="mt-2 p-2 bg-gray-700 rounded-lg">
                <Image
                  src={node.imgURL}
                  alt={node.title}
                  width={300}
                  height={170}
                  className="rounded"
                />
                <div className="text-white mt-2">
                  <strong>タグ:</strong> {node.genres?.map((item: any) => item.description).join(", ") || "No tags"}
                </div>
                <div className="text-white mt-2">
                  <strong>価格:</strong> {node.price ? `${node.price}円` : "無料"}
                </div>
                <div className="mt-4 flex space-x-2">
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
                    className="bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded"
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
