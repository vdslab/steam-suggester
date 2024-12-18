"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { ISR_FETCH_INTERVAL } from "@/constants/DetailsConstants";
import { changeGameIdData, getGameIdData } from "@/hooks/indexedDB";
import { NodeType, SteamListType } from "@/types/NetworkType";
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import SearchIcon from "@mui/icons-material/Search";
import Section from "../Section";
import HelpTooltip from "../HelpTooltip";
import SearchBar from "./SearchBar";
import ListContent from "./ListContent";

type Props = {
  nodes: NodeType[];
  selectedIndex: number;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
  setCenterX: React.Dispatch<React.SetStateAction<number>>;
  setCenterY: React.Dispatch<React.SetStateAction<number>>;
  setIsLoading?: React.Dispatch<React.SetStateAction<boolean>>;
  setIsNetworkLoading?: React.Dispatch<React.SetStateAction<boolean>>;
  setGameIds: React.Dispatch<React.SetStateAction<string[]>>;
};


const GameList = (props: Props) => {
  const { nodes, selectedIndex, setSelectedIndex, setCenterX, setCenterY, setIsLoading, setIsNetworkLoading, setGameIds } = props;

  const [steamList, setSteamList] = useState<SteamListType[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredSteamList, setFilteredSteamList] = useState<SteamListType[]>([]);
  const [filteredNodeList, setFilteredNodeList] = useState<NodeType[]>(nodes);
  const [userAddedGames, setUserAddedGames] = useState<string[]>([]);

  // Ref for the selected game detail
  const selectedDetailRef = useRef<HTMLDivElement | null>(null);

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

    const allSteamList: SteamListType[] = nodes.map((node: NodeType): SteamListType => {
      return {
        steamGameId: node.steamGameId,
        title: node.title,
        index: node.index
      }
    });

    allSteamList.push(...steamList.filter((item1: SteamListType) => !allSteamList.find((item2: SteamListType) => item2.steamGameId === item1.steamGameId)));

    // Steamリストのフィルタリング（ユーザーが追加していないゲームかつ固定ゲームではないもの）
    const filteredSteam = allSteamList
      .filter((game) =>
        game.title.toLowerCase().includes(lowerCaseQuery) && game.steamGameId
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

  console.log("GameList.tsx: filteredNodeList", filteredSteamList);

  // ゲームをクリックしたときの処理
  const handleGameClick = (index: number) => {
    setCenterX((nodes[index].x ?? 0) - 150);
    setCenterY((nodes[index].y ?? 0) + 100);
    setSelectedIndex(index);
  };

  // ゲームを追加する処理
  const handleSearchClick = (steamGameId: string) => {
    if(!userAddedGames.includes(steamGameId) && !fixedGameIds.includes(steamGameId)) {
      const newUserAddedGames = [...userAddedGames, steamGameId];
      setUserAddedGames(newUserAddedGames);
      (async () => {
        await changeGameIdData(newUserAddedGames);
        await setGameIds(newUserAddedGames);
        setSearchQuery('');
        // TODO:
        if(setIsNetworkLoading) {
          setIsNetworkLoading(true);
        } else if (setIsLoading) {
          setIsLoading(true);
        }
      })();
    }
  };

  // ゲームを削除する処理
  const handleGameDelete = (steamGameId: string) => {
    const newUserAddedGames = userAddedGames.filter((gameId: string) => gameId !== steamGameId);
    setUserAddedGames(newUserAddedGames);
    (async () => {
      await changeGameIdData(newUserAddedGames);
      // TODO:
      if(setIsNetworkLoading) {
        setIsNetworkLoading(true);
      } else if (setIsLoading) {
        setIsLoading(true);
      }
    })();
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


  // メッセージ表示の条件判定
  const showNoResultsMessage = searchQuery !== '' && filteredNodeList.length === 0;
  const showAddGameMessage = showNoResultsMessage && filteredSteamList.length > 0;

  // 判定用フラグ: いずれかのゲームが選択されているか
  const anyGameSelected = selectedIndex !== -1;

  return (
    <div className="flex-1 bg-gray-800 rounded-r-lg p-4 shadow-md flex flex-col space-y-2 h-full">
      {/* ヘッダー */}
      <div className="flex items-center space-x-2 mb-4">
        <SportsEsportsIcon className="text-white" />
        <div className="flex items-center">
          <span className="text-white text-lg font-semibold">ゲームリスト</span>
          <HelpTooltip title="ゲームの人気順に並んでいます。検索フォームを使ってゲームを追加したり、リストを絞り込むことができます。" />
        </div>
      </div>
      
      {/* コンテンツエリア */}
      <div className="flex-1 border-t border-gray-700 pt-2 overflow-y-auto">
        {/* 全ゲームから検索セクション */}
        <Section title="全ゲームから検索" icon={<SearchIcon />} hasDivider={false}>
          {/* 検索入力 */}
          <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
          
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
                  <div key={"filteredSteamList" + game.steamGameId}>
                    {typeof game.index === "number" ? (
                      <div className='cursor-pointer flex pb-2 items-center' onClick={() => handleGameClick(game.index as number)}>
                        <div className={`${selectColor(game.index + 1).rankColor} p-2`}>
                          {game.index + 1}位
                        </div>
                        <div className="text-white p-2">
                          {game.title}
                        </div>
                      </div>
                    ) : (
                      <div className='flex pb-2 justify-between items-center'>
                        <div className="text-white p-2 rounded">
                          {game.title}
                        </div>
                        <PlaylistAddIcon
                          className='cursor-pointer hover:bg-gray-600 rounded'
                          onClick={() => handleSearchClick(game.steamGameId)}
                        />
                      </div>
                    )}
                  </div>
                ))
              ) : null /* メッセージは上部に移動したためここでは何も表示しない */}
            </div>
          )}

          {/* ゲームリスト表示 */}
          <div className="bg-gray-700 p-2 rounded-lg overflow-y-auto step6">
            {nodes.length > 0 ? (
              <div className="space-y-2">
                {nodes.map((node: NodeType) => {
                  return (
                  <ListContent
                    key={node.steamGameId}
                    node={node}
                    selectedIndex={selectedIndex}
                    setSelectedIndex={setSelectedIndex}
                    userAddedGames={userAddedGames}
                    handleGameClick={handleGameClick}
                    handleGameDelete={handleGameDelete}
                    selectedDetailRef={selectedDetailRef}
                    anyGameSelected={anyGameSelected}
                  />
                )})}
              </div>
            ) : (
              /* ゲームリストが空の場合、メッセージは上部に表示されるためここでは何も表示しない */
              null
            )}
          </div>
        </Section>
      </div>
    </div>
  );
};

export default GameList;
