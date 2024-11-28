"use client";

import { useEffect, useState, useRef } from "react";
import { ISR_FETCH_INTERVAL } from "@/constants/DetailsConstants";
import { changeGameIdData, getGameIdData } from "@/hooks/indexedDB";
import { NodeType, SteamListType } from "@/types/NetworkType";
import Image from "next/image";
import { useRouter } from 'next/navigation';
import { SteamGenreType } from "@/types/api/getSteamDetailType";
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import SearchIcon from "@mui/icons-material/Search";
import ListIcon from "@mui/icons-material/List";
import Panel from "../Panel";
import Section from "../Section";

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
  const [searchNodesQuery, setSearchNodesQuery] = useState<string>('');
  const [filteredSteamList, setFilteredSteamList] = useState<SteamListType[]>([]);
  const [filteredNodeList, setFilteredNodeList] = useState<NodeType[]>(nodes);
  const [userAddedGames, setUserAddedGames] = useState<string[]>([]);

  // Ref for the selected game detail
  const selectedDetailRef = useRef<HTMLDivElement | null>(null);

  // Steamゲームリストとユーザーが追加したゲームを取得
  useEffect(() => {
    (async () => {
      const CURRENT_URL = process.env.NEXT_PUBLIC_CURRENT_URL || '';
      const res1 = await fetch(
        `${CURRENT_URL}/api/network/getSteamList`,
        { next: { revalidate: ISR_FETCH_INTERVAL } }
      );
      if(!res1.ok) {
        return;
      }
      const data = await res1.json();
      const res2 = await getGameIdData();

      setSteamList(data);
      setFilteredSteamList(data);
      setUserAddedGames(res2 ?? []);
    })();
  }, []);

  // Steamゲームの検索結果をフィルタリング
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

  // ゲームリスト内の検索結果をフィルタリング
  useEffect(() => {
    if(searchNodesQuery === '') {
      setFilteredNodeList(nodes);
    } else {
      const filteredList = nodes
        .filter((game) =>
          game.title.toLowerCase().includes(searchNodesQuery.toLowerCase())
        )
      setFilteredNodeList(filteredList);
    }
  }, [nodes, searchNodesQuery]);

  // ゲームをクリックしたときの処理
  const handleGameClick = (index: number) => {
    setCenterX(nodes[index].x ?? 0);
    setCenterY((nodes[index].y ?? 0) + 100);
    setSelectedIndex(index);
  };

  // ゲームを追加する処理
  const handleSearchClick = (steamGameId: string) => {
    if(!userAddedGames.includes(steamGameId)) {
      const newUserAddedGames = [...userAddedGames, steamGameId];
      setUserAddedGames(newUserAddedGames);
      changeGameIdData(newUserAddedGames);
      setIsLoading(true);
    }
  };

  // ゲームを削除する処理
  const handleGameDelete = (steamGameId: string) => {
    const newUserAddedGames = userAddedGames.filter((gameId: string) => gameId !== steamGameId);
    setUserAddedGames(newUserAddedGames);
    changeGameIdData(newUserAddedGames);
    setIsLoading(true);
  };

  // ランクカラーの選択
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

  // 自動スクロール機能の追加
  useEffect(() => {
    if (selectedIndex !== -1 && selectedDetailRef.current) {
      selectedDetailRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedIndex]);

  return (
    <Panel title="ゲームリスト" icon={<SportsEsportsIcon className="mr-2" />}>
      {/* ゲームタイトルから検索して追加する機能 */}
      <Section title="ゲームを追加" icon={<SearchIcon />}>
        <input
          type="text"
          placeholder="ゲームタイトルを検索して追加"
          value={searchSteamQuery}
          onChange={(e) => setSearchSteamQuery(e.target.value)}
          className="w-full p-2 mb-2 text-black rounded border-2 border-gray-300 focus:outline-none focus:border-blue-500 transition duration-300 ease-in-out"
        />
        {searchSteamQuery !== '' && (
          <div className="bg-gray-700 p-2 rounded-lg mb-4 max-h-40 overflow-y-auto">
            <h2 className="text-white mb-2">検索結果</h2>
            {filteredSteamList.map((game) => (
              <div className='flex pb-2 justify-between items-center' key={game.steamGameId}>
                <div className="text-white p-2 rounded">
                  {game.title}
                </div>
                <PlaylistAddIcon
                  className='cursor-pointer hover:bg-gray-600 rounded'
                  onClick={() => handleSearchClick(game.steamGameId)}
                />
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* ゲームリストから検索する機能 */}
      <Section title="ゲームリスト検索" icon={<SearchIcon />}>
        <input
          type="text"
          placeholder="ゲームリストを検索"
          value={searchNodesQuery}
          onChange={(e) => setSearchNodesQuery(e.target.value)}
          className="w-full p-2 mb-2 text-black rounded border-2 border-gray-300 focus:outline-none focus:border-blue-500 transition duration-300 ease-in-out"
        />
      </Section>

      {/* ゲームリスト */}
      <Section title="ゲームタイトル" icon={<ListIcon />} hasDivider={false}>
        {filteredNodeList.map((node: NodeType, index: number) => {
          const isSelected = selectedIndex === index;
          const { rankColor } = selectColor(index);
          const isUserAdded = userAddedGames.includes(node.steamGameId);

          return (
            <div
              key={node.index}
              className={`cursor-pointer ${isSelected ? 'bg-gray-700' : 'bg-gray-800'} rounded-lg`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center" onClick={() => handleGameClick(index)}>
                  <div className={`${rankColor} pb-2 p-2`}>
                    {index + 1}位
                  </div>
                  <div className="text-white p-2">
                    {node.title}
                  </div>
                </div>
                {isUserAdded && (
                  <DeleteIcon 
                    className='cursor-pointer hover:bg-gray-600 rounded'
                    onClick={() => handleGameDelete(node.steamGameId)}
                  />
                )}
              </div>
              {isSelected && (
                <div className="mt-2 p-2" ref={selectedDetailRef}>
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
                  <div className="text-white mt-2">
                    <strong>タグ:</strong> {node.genres?.map((item: SteamGenreType) => item.description).join(", ") || "No tags"}
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
      </Section>
    </Panel>
  );
};

export default GameList;
