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
import Section from "../Section";
import HelpTooltip from "../HelpTooltip";
import StarIcon from '@mui/icons-material/Star';
import LanguageIcon from '@mui/icons-material/Language';
import DeveloperModeIcon from '@mui/icons-material/DeveloperMode';
import DevicesIcon from '@mui/icons-material/Devices';
import MultilineChartIcon from '@mui/icons-material/MultilineChart';
import InfoIcon from '@mui/icons-material/Info';
import LaptopWindowsIcon from '@mui/icons-material/LaptopWindows';
import AppleIcon from '@mui/icons-material/Apple';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import Tooltip from '@mui/material/Tooltip';
import PriceDisplay from "./PriceDisplay";

type Props = {
  nodes: NodeType[];
  selectedIndex: number;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
  setCenterX: React.Dispatch<React.SetStateAction<number>>;
  setCenterY: React.Dispatch<React.SetStateAction<number>>;
  setIsLoading?: React.Dispatch<React.SetStateAction<boolean>>;
  setIsNetworkLoading?: React.Dispatch<React.SetStateAction<boolean>>;
};

const MAX_VISIBLE_TAGS = 3; // 表示する最大タグ数

const GameList = (props: Props) => {
  const { nodes, selectedIndex, setSelectedIndex, setCenterX, setCenterY, setIsLoading, setIsNetworkLoading } = props;
  const router = useRouter();
  console.log(nodes[0])
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
      (async () => {
        await changeGameIdData(newUserAddedGames);
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

  // タグの表示切替関数
  const toggleTags = () => {
    setIsTagsExpanded((prev) => !prev);
  };

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
                {nodes.map((node: NodeType, idx: number) => {
                  const nodeIndex = nodes.findIndex(n => n.steamGameId === node.steamGameId);
                  const isSelected = selectedIndex === nodeIndex;
                  const { rankColor } = selectColor(node.index + 1);
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
                          <div className={`${rankColor} pb-2 p-2 whitespace-nowrap`}>
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
                          
                          {/* Short Details */}
                          <div className="flex items-start my-2">
                            <InfoIcon className="mt-1 mr-1 mb-1" />
                            <div className="max-h-20 overflow-y-auto">
                              <p className="text-sm">{node.shortDetails}</p>
                            </div>
                          </div>

                          {/* ジャンル */}
                          {node.genres && node.genres.length > 0 && (
                              <div className="flex items-center space-x-0.5 overflow-x-auto short-overflow-y">
                                {/* <StarIcon className="flex-shrink-0" /> */}
                                {/* <div className="flex space-x-1"> */}
                                  {node.genres.map((genre, index) => (
                                    <span key={index} className="bg-blue-500 text-xs text-white px-1 py-0 rounded flex-shrink-0">
                                      {genre}
                                    </span>
                                  ))}
                                {/* </div> */}
                              </div>
                            )}

                            {/* タグ */}
                            <div className="text-white mt-2">
                              {/* <strong>タグ:</strong> */}
                              {node.tags && node.tags.length > 0 && (
                                <div className="flex items-center space-x-0.5 overflow-x-auto mt-1 short-overflow-y">
                                  {node.tags.map((tag, index) => (
                                    <span
                                      key={index}
                                      className="bg-green-500 text-xs text-white px-1 py-0 rounded whitespace-nowrap flex-shrink-0"
                                      title={tag} // ツールチップとしてタグ名を表示
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                              
                          {/* アイコン表示block */}
                          <div className="flex items-center space-x-1 mt-1 mb-2">
                            {/* デバイスサポート */}
                            {node.device.windows && 
                              <Tooltip title="windows対応">
                                <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 40 40" width="20px" height="20px"><path d="M26 6H42V22H26zM38 42H26V26h16v12C42 40.209 40.209 42 38 42zM22 22H6V10c0-2.209 1.791-4 4-4h12V22zM6 26H22V42H6z" fill="white"/></svg>
                              </Tooltip>
                            }
                            {node.device.mac && 
                              <Tooltip title="mac対応">
                                <AppleIcon className="text-white h-5 w-5" />
                              </Tooltip>
                            }

                            {/* マルチプレイヤー情報 */}
                            {node.isSinglePlayer && (
                              <Tooltip title="Single Player">
                                <PersonIcon className="text-white h-5 w-5" />
                              </Tooltip>
                            )}
                            {node.isMultiPlayer && (
                              <Tooltip title="Multiplayer">
                                <GroupIcon className="text-white h-5 w-5" />
                              </Tooltip>
                            )}
                          </div>

                          {/* Developer & Release Date */}
                          <div className="flex items-center">
                              {/* <DeveloperModeIcon className="mr-2" /> */}
                              <span className="text-sm mb-1">開発者: {node.developerName}</span>
                            </div>
                            <div className="flex items-center">
                              {/* <LanguageIcon className="mr-2" /> */}
                              <span className="text-sm mb-1">発売日: {node.releaseDate}</span>
                          </div>

                          {/* 価格 */}
                          <div className="flex items-center">
                            <div>価格: </div>
                            {node.salePrice && parseInt(node.salePrice, 10) < node.price ? (
                              <>
                                <span className="line-through text-gray-400 ml-2">¥{node.price}</span>
                                <span className="text-red-500 ml-2">¥{node.salePrice}</span>
                              </>
                            ) : (
                              <span className="text-sm ml-2">{node.price ? `¥${node.price}` : "無料"}</span>
                            )}
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
      </div>
    </div>
  );
};

export default GameList;
