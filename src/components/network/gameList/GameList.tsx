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
  const [searchListQuery, setSearchListQuery] = useState<string>('');
  const [filteredSteamList, setFilteredSteamList] = useState<SteamListType[]>([]);
  const [filteredNodeList, setFilteredNodeList] = useState<NodeType[]>(nodes);
  const [userAddedGames, setUserAddedGames] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const res1 = await fetch(
        `${process.env.NEXT_PUBLIC_CURRENT_URL}/api/network/getSteamList`,
        { next: { revalidate: ISR_FETCH_INTERVAL } }
      );
      if (!res1.ok) {
        console.error("Failed to fetch Steam list");
        return;
      }
      const data: SteamListType[] = await res1.json();
      const res2 = await getGameIdData();

      setSteamList(data);
      setFilteredSteamList(data);
      setUserAddedGames(res2 ?? []);
    })();
  }, []);

  useEffect(() => {
    if (searchSteamQuery === '') {
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

  useEffect(() => {
    if (searchListQuery === '') {
      setFilteredNodeList(nodes);
    } else {
      const filteredList = nodes.filter((game) =>
        game.title.toLowerCase().includes(searchListQuery.toLowerCase())
      );
      setFilteredNodeList(filteredList);
    }
  }, [nodes, searchListQuery]);

  const handleAddGame = async (steamGameId: string) => {
    if (!userAddedGames.includes(steamGameId)) {
      const newUserAddedGames = [...userAddedGames, steamGameId];
      setUserAddedGames(newUserAddedGames);
      await changeGameIdData(newUserAddedGames);
      setIsLoading(true);
    }
  };

  const handleDeleteGame = async (steamGameId: string) => {
    const newUserAddedGames = userAddedGames.filter((gameId) => gameId !== steamGameId);
    setUserAddedGames(newUserAddedGames);
    await changeGameIdData(newUserAddedGames);
    setIsLoading(true);
  };

  const handleGameClick = (index: number) => {
    setCenterX(nodes[index].x ?? 0);
    setCenterY((nodes[index].y ?? 0) + 100);
    setSelectedIndex(index);
  };

  const selectColor = (index: number) => {
    let rankColor = "text-white";
    if (index === 0) rankColor = "text-yellow-500";
    else if (index === 1) rankColor = "text-gray-400";
    else if (index === 2) rankColor = "text-orange-500";
    return { rankColor };
  };

  return (
    <div style={{ maxHeight: '92vh', overflowY: 'auto', paddingBottom: '120px' }}>
      {/* ゲームタイトルから検索して追加する機能 */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="ゲームタイトルで検索して追加"
          value={searchSteamQuery}
          onChange={(e) => setSearchSteamQuery(e.target.value)}
          className="w-full p-2 mb-2 text-black rounded"
        />
        {searchSteamQuery !== '' && (
          <div className="bg-gray-800 p-2 rounded-lg mb-4">
            <h2 className="text-white mb-2">検索結果</h2>
            {filteredSteamList.length > 0 ? (
              filteredSteamList.map((game) => (
                <div className='flex pb-2 justify-between items-center' key={game.steamGameId}>
                  <div className="text-white p-2 rounded">
                    {game.title}
                  </div>
                  <PlaylistAddIcon
                    className='cursor-pointer hover:bg-gray-700 rounded p-1'
                    onClick={() => handleAddGame(game.steamGameId)}
                  />
                </div>
              ))
            ) : (
              <div className="text-gray-400">該当するゲームがありません。</div>
            )}
          </div>
        )}
      </div>

      {/* ゲームリストから検索する機能 */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="ゲームリストから検索"
          value={searchListQuery}
          onChange={(e) => setSearchListQuery(e.target.value)}
          className="w-full p-2 mb-2 text-black rounded"
        />
      </div>

      {/* ユーザー追加ゲームリスト */}
      <div className="bg-gray-800 p-2 rounded-lg mb-4">
        <h2 className="text-white mb-2">追加されたゲームリスト</h2>
        {userAddedGames.slice().sort((gameId1: string, gameId2: string) => {
          const index1 = nodes.findIndex((node: NodeType) => node.steamGameId === gameId1);
          const index2 = nodes.findIndex((node: NodeType) => node.steamGameId === gameId2);
          if (index1 === -1) return 1;
          if (index2 === -1) return -1;
          return index1 - index2;
        }).map((gameId) => {
          const nodeIndex = nodes.findIndex((node: NodeType) => node.steamGameId === gameId);
          const game = steamList.find(game => game.steamGameId === gameId) || nodes.find(node => node.steamGameId === gameId);
          const isInNodes = nodeIndex >= 0;
          const { rankColor } = selectColor(nodeIndex);
          return game ? (
            <div className='flex pb-2 justify-between items-center' key={game.steamGameId}>
              <div className='flex items-center'>
                <div className={`${rankColor} pb-2 p-2`}>
                  {nodeIndex >= 0 ? `${nodeIndex + 1}位` : '-'}
                </div>
                <div className={`${isInNodes ? 'text-white' : 'text-slate-400'} p-2 rounded`}>
                  {isInNodes ? (
                    <div 
                      className='cursor-pointer'
                      onClick={() => handleGameClick(nodeIndex)}
                    >
                      {game.title}
                    </div>
                  ) : (
                    <div>{game.title}</div>
                  )}
                </div>
              </div>
              <DeleteIcon 
                className='cursor-pointer hover:bg-gray-700 rounded p-1'
                onClick={() => handleDeleteGame(game.steamGameId)}
              />
            </div>
          ) : null;
        })}
      </div>

      {/* ネットワークノードリスト */}
      <div className="bg-gray-800 p-2 rounded-lg">
        <h2 className="text-white mb-2">ネットワークノードリスト</h2>
        {filteredNodeList.length > 0 ? (
          filteredNodeList.map((node: NodeType, index: number) => {
            const isUserAdded = userAddedGames.includes(node.steamGameId);
            const { rankColor } = selectColor(index);
            return (
              <div
                className='flex items-center mb-2 cursor-pointer hover:bg-gray-700 p-2 rounded-lg'
                key={node.index}
                onClick={() => handleGameClick(index)}
              >
                <div className={`${rankColor} pb-2 p-2`}>
                  {index + 1}位
                </div>
                <div className={`flex-1 ${isUserAdded ? 'text-yellow-300' : 'text-slate-100'} p-2 rounded`}>
                  {node.title}
                </div>
                {isUserAdded && (
                  <DeleteIcon 
                    className='cursor-pointer hover:bg-gray-700 rounded p-1'
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteGame(node.steamGameId);
                    }}
                  />
                )}
              </div>
            );
          })
        ) : (
          <div className="text-gray-400">ゲームが見つかりません。</div>
        )}
      </div>

      {/* 選択されたゲームの詳細表示 */}
      {selectedIndex !== -1 && nodes[selectedIndex] && (
        <div className="mt-4 bg-gray-700 p-4 rounded-lg">
          <h3 className="text-white text-xl mb-2">{nodes[selectedIndex].title}</h3>
          <Image
            src={nodes[selectedIndex].imgURL}
            alt={nodes[selectedIndex].title}
            width={300}
            height={170}
            className="rounded"
          />
          <div className="text-white mt-2">
            <strong>タグ:</strong> {nodes[selectedIndex].genres?.map((item: SteamGenreType) => item.description).join(", ") || "No tags"}
          </div>
          <div className="text-white mt-2">
            <strong>価格:</strong> {nodes[selectedIndex].price ? `${nodes[selectedIndex].price}円` : "無料"}
          </div>
          <div className="mt-4 flex space-x-2">
            <button
              className="bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded"
              onClick={() =>
                router.push(
                  `/desktop/details?steam_id=${nodes[selectedIndex].steamGameId}&twitch_id=${nodes[selectedIndex].twitchGameId}`
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
};

export default GameList;
