"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { ISR_FETCH_INTERVAL } from "@/constants/DetailsConstants";
import { changeGameIdData, getGameIdData } from "@/hooks/indexedDB";
import { NodeType, SteamListType } from "@/types/NetworkType";
import Image from "next/image";
import { useRouter } from 'next/navigation';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import SearchIcon from "@mui/icons-material/Search";
import Panel from "../Panel";
import Section from "../Section";
import HelpTooltip from "../HelpTooltip";

type Props = {
  nodes: NodeType[];
  selectedIndex: number;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
  setCenterX: React.Dispatch<React.SetStateAction<number>>;
  setCenterY: React.Dispatch<React.SetStateAction<number>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

const MAX_VISIBLE_TAGS = 3; // 表示する最大タグ数

const GameList = (props: Props) => {
  const { nodes, selectedIndex, setSelectedIndex, setCenterX, setCenterY, setIsLoading } = props;
  const router = useRouter();

  const [steamList, setSteamList] = useState<SteamListType[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredSteamList, setFilteredSteamList] = useState<SteamListType[]>([]);
  const [filteredNodeList, setFilteredNodeList] = useState<NodeType[]>(nodes);
  const [userAddedGames, setUserAddedGames] = useState<string[]>([]);

  // Ref for the selected game detail
  const selectedDetailRef = useRef<HTMLDivElement | null>(null);

  // タグの展開状態を管理
  const [isTagsExpanded, setIsTagsExpanded] = useState<boolean>(false);

  // 固定のゲームIDリストを取得
  const fixedGameIds = useMemo(() => nodes.map(node => node.steamGameId), [nodes]);

  // Steamゲームリストとユーザーが追加したゲームを取得
  useEffect(() => {
    (async () => {
      const CURRENT_URL = process.env.NEXT_PUBLIC_CURRENT_URL || '';
      const res1 = await fetch(
        `${CURRENT_URL}/api/network/getSteamList`,
        { next: { revalidate: ISR_FETCH_INTERVAL } }
      );
      if(!res1.ok) {
        console.error("Failed to fetch Steam list");
        return;
      }
      const data = await res1.json();
      const res2 = await getGameIdData();

      setSteamList(data);
      setUserAddedGames(res2 ?? []);
    })();
  }, []);

  // Steamリストとユーザー追加ゲームがロードされた後にフィルタリングを行う
  useEffect(() => {
    const lowerCaseQuery = searchQuery.toLowerCase();

    // Steamリストのフィルタリング（ユーザーが追加していないゲームかつ固定ゲームではないもの）
    const filteredSteam = steamList
      .filter((game) =>
        game.title.toLowerCase().includes(lowerCaseQuery)
      )
      .filter((game) => 
        !userAddedGames.includes(game.steamGameId) && 
        !fixedGameIds.includes(game.steamGameId)
      )
      .slice(0, 20); // 20件に制限

    setFilteredSteamList(filteredSteam);

    // ノードリストのフィルタリング
    if(searchQuery === '') {
      setFilteredNodeList(nodes);
    } else {
      const filteredNodes = nodes
        .filter((game) =>
          game.title.toLowerCase().includes(lowerCaseQuery)
        );
      setFilteredNodeList(filteredNodes);
    }
  }, [steamList, searchQuery, userAddedGames, nodes, fixedGameIds]);

  // 元の順位を保持するマッピングを作成
  const rankMap = useMemo(() => {
    const map: { [steamGameId: string]: number } = {};
    nodes.forEach((node, idx) => {
      map[node.steamGameId] = idx + 1; // 1位から始まる
    });
    return map;
  }, [nodes]);

  // ゲームをクリックしたときの処理
  const handleGameClick = (index: number) => {
    setCenterX((nodes[index].x ?? 0) - 150);
    setCenterY((nodes[index].y ?? 0) + 100);
    setSelectedIndex(index);
    setIsTagsExpanded(false); // 新しいゲームを選択したらタグを折りたたむ
  };

  // ゲームを追加する処理
  const handleSearchClick = (steamGameId: string) => {
    if(!userAddedGames.includes(steamGameId) && !fixedGameIds.includes(steamGameId)) {
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

  // 自動スクロール機能の追加
  useEffect(() => {
    if (selectedIndex !== -1 && selectedDetailRef.current) {
      selectedDetailRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedIndex]);

  // タグの表示切替関数
  const toggleTags = () => {
    setIsTagsExpanded((prev) => !prev);
  };

  // メッセージ表示の条件判定
  const showNoResultsMessage = searchQuery !== '' && filteredNodeList.length === 0;
  const showAddGameMessage = showNoResultsMessage && filteredSteamList.length > 0;
  const showNoGameFoundMessage = showNoResultsMessage && filteredSteamList.length === 0;

  // 判定用フラグ: いずれかのゲームが選択されているか
  const anyGameSelected = selectedIndex !== -1;

  return (
    <Panel
        title={
          <div className="flex items-center step5">
            <span>ゲームリスト</span>
            <HelpTooltip title="ゲームの人気順に並んでいます。検索フォームを使ってゲームを追加したり、リストを絞り込むことができます。" />
          </div>
        }
        icon={<SportsEsportsIcon className="mr-2 text-white" />}
      >
      {/* 全ゲームから検索セクション */}
      <Section title="全ゲームから検索" icon={<SearchIcon />} hasDivider={false}>
        {/* <p className="text-gray-400 mb-2">ゲームの人気順に並んでいます。検索フォームを使ってゲームを追加したり、リストを絞り込むことができます。</p> */}
        <input
          type="text"
          placeholder="ゲームタイトルを検索"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 mb-2 text-black rounded border-2 border-gray-300 focus:outline-none focus:border-blue-500 transition duration-300 ease-in-out"
        />
        
        {/* メッセージ表示エリア */}
        {showNoResultsMessage && (
          <p className="text-gray-300 mb-4">
            {showAddGameMessage
              ? "該当するゲームが見つかりません。ゲームを追加してください。"
              : "該当するゲームが見つかりません。別のゲームをお探しください。"}
          </p>
        )}

        {/* ゲーム追加候補表示 */}
        {searchQuery !== '' && filteredSteamList.length > 0 && (
          <div className="bg-gray-700 p-2 rounded-lg mb-4 max-h-40 overflow-y-auto">
            <h2 className="text-white mb-2">検索結果（追加候補）</h2>
            {filteredSteamList.length > 0 ? (
              filteredSteamList.map((game) => (
                <div className='flex pb-2 justify-between items-center' key={game.steamGameId}>
                  <div className="text-white p-2 rounded">
                    {game.title}
                  </div>
                  <PlaylistAddIcon
                    className='cursor-pointer hover:bg-gray-600 rounded'
                    onClick={() => handleSearchClick(game.steamGameId)}
                  />
                </div>
              ))
            ) : null /* メッセージは上部に移動したためここでは何も表示しない */}
          </div>
        )}

        {/* ゲームリスト表示 */}
        <div className="bg-gray-700 p-2 rounded-lg overflow-y-auto step6">
          {filteredNodeList.length > 0 ? (
            <div className="space-y-2">
              {filteredNodeList.map((node: NodeType, idx: number) => {
                const originalRank = rankMap[node.steamGameId] || 0; // 元の順位を取得
                const nodeIndex = nodes.findIndex(n => n.steamGameId === node.steamGameId);
                const isSelected = selectedIndex === nodeIndex;
                const { rankColor } = selectColor(originalRank);
                const isUserAdded = userAddedGames.includes(node.steamGameId);

                // 判定: 何かしらのゲームが選択されている場合
                const dimmed = anyGameSelected && !isSelected;

                return (
                  <div
                    key={node.steamGameId} // 一意のキーを使用
                    className={`cursor-pointer rounded-lg transform transition-all duration-300 ${
                      isSelected 
                        ? 'bg-gray-800 border-2 shadow-xl p-2 mb-4 scale-x-105 scale-y-102' 
                        : 'bg-gray-900 p-2'
                    } ${dimmed ? 'opacity-50' : 'opacity-100'} space-y-2`}
                  >
                    <div 
                      className="flex items-center justify-between"
                      onClick={() => handleGameClick(nodeIndex)}
                    >
                      <div className="flex items-center">
                        <div className={`${rankColor} pb-2 p-2`}>
                          {originalRank}位
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
                        <div className="text-white mt-2">
                          <strong>タグ:</strong> 
                          {node.tags && node.tags.length > MAX_VISIBLE_TAGS ? (
                            <>
                              {isTagsExpanded 
                                ? node.tags.join(", ") 
                                : node.tags.slice(0, MAX_VISIBLE_TAGS).join(", ")}
                              <button 
                                className="ml-2 text-blue-400 hover:underline focus:outline-none"
                                onClick={toggleTags}
                              >
                                {isTagsExpanded ? "一部のタグのみ表示" : "..."}
                              </button>
                            </>
                          ) : (
                            node.tags?.join(", ") || "No tags"
                          )}
                        </div>
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
                );
              })}
            </div>
          ) : (
            /* ゲームリストが空の場合、メッセージは上部に表示されるためここでは何も表示しない */
            null
          )}
        </div>
      </Section>
    </Panel>
  );
};

export default GameList;
