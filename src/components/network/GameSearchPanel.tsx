"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { changeGameIdData, getGameIdData } from "@/hooks/indexedDB";
import { NodeType, SteamListType } from "@/types/NetworkType";
import Image from "next/image";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import Tooltip from "@mui/material/Tooltip";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import Link from "next/link";
import Popularity from "./Popularity2";
import ReviewCloud from "../charts/ReviewCloud";
import { SteamDetailsDataType } from "@/types/api/getSteamDetailType";

type Props = {
  nodes: NodeType[];
  selectedIndex: number;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
  setIsNetworkLoading: React.Dispatch<React.SetStateAction<boolean>>;
  steamListData: SteamListType[];
  steamAllData: SteamDetailsDataType[];
  setOpenPanel: React.Dispatch<React.SetStateAction<string | null>>;
  selectedTags: string[];
  setSelectedTags: React.Dispatch<React.SetStateAction<string[]>>;
};

const GameSearchPanel = (props: Props) => {
  const {
    steamListData,
    nodes,
    selectedIndex,
    setSelectedIndex,
    setIsNetworkLoading,
    steamAllData,
    setOpenPanel,
    selectedTags,
    setSelectedTags,
  } = props;
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredSteamList, setFilteredSteamList] = useState<SteamListType[]>(
    []
  );
  const [userAddedGames, setUserAddedGames] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState<boolean>(false);

  // Ref for the selected game detail
  const selectedDetailRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // 固定のゲームIDリストを取得
  const fixedGameIds = useMemo(
    () => nodes.map((node) => node.steamGameId),
    [nodes]
  );

  // Steamゲームリストとユーザーが追加したゲームを取得
  useEffect(() => {
    (async () => {
      const res = await getGameIdData();
      setUserAddedGames(res ?? []);
    })();
  }, []);

  // ゲーム選択時に検索クエリを設定
  useEffect(() => {
    if (selectedIndex !== -1 && nodes[selectedIndex]) {
      setSearchQuery(nodes[selectedIndex].title);
    }
  }, [selectedIndex, nodes]);

  // Steamリストとユーザー追加ゲームがロードされた後にフィルタリングを行う
  useEffect(() => {
    const lowerCaseQuery = searchQuery.toLowerCase();

    const allSteamList: SteamListType[] = nodes.map(
      (node: NodeType): SteamListType => {
        return {
          steamGameId: node.steamGameId,
          title: node.title,
          index: node.index,
        };
      }
    );

    allSteamList.push(
      ...steamListData.filter(
        (item1: SteamListType) =>
          !allSteamList.find(
            (item2: SteamListType) => item2.steamGameId === item1.steamGameId
          )
      )
    );

    // Steamリストのフィルタリング（ユーザーが追加していないゲームかつ固定ゲームではないもの）
    const filteredSteam = allSteamList
      .filter(
        (game) =>
          game.title.toLowerCase().includes(lowerCaseQuery) && game.steamGameId
      )
      .slice(0, 20); // 20件に制限

    setFilteredSteamList(filteredSteam);
  }, [searchQuery, userAddedGames, nodes, fixedGameIds, steamListData]);

  // ゲームを追加する処理
  const handleSearchClick = (steamGameId: string) => {
    if (
      !userAddedGames.includes(steamGameId) &&
      !fixedGameIds.includes(steamGameId)
    ) {
      const newUserAddedGames = [...userAddedGames, steamGameId];
      setUserAddedGames(newUserAddedGames);
      (async () => {
        await changeGameIdData(newUserAddedGames);
        setSearchQuery("");
        setIsNetworkLoading(true);
      })();
    }
  };

  // ゲームを削除する処理
  const handleGameDelete = (steamGameId: string) => {
    const newUserAddedGames = userAddedGames.filter(
      (gameId: string) => gameId !== steamGameId
    );
    setUserAddedGames(newUserAddedGames);
    (async () => {
      await changeGameIdData(newUserAddedGames);
      setSearchQuery("");
      setIsNetworkLoading(true);
    })();
  };

  // ランクカラーの選択
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

  // 自動スクロール機能の追加
  useEffect(() => {
    if (selectedIndex !== -1 && selectedDetailRef.current) {
      selectedDetailRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [selectedIndex]);

  // メッセージ表示の条件判定
  const showNoResultsMessage =
    searchQuery !== "" && filteredSteamList.length === 0;

  // 閉じるボタンのハンドラー
  const handleClose = () => {
    setSelectedIndex(-1);
    setSearchQuery("");
  };

  // 外部クリックを検出してフォーカスを解除
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const addSelectedTags = (newTag:string) => {
    if(selectedTags.includes(newTag)) return;
    setSelectedTags([...selectedTags, newTag]);
    setOpenPanel("highlight");
  }

  return (
    <div className="flex-1 bg-gray-800 rounded-l-lg p-0 shadow-md flex flex-col space-y-0 overflow-y-scroll h-full relative">

      {/* 検索フォームと検索候補を絶対位置に配置 */}
      <div
        className="absolute top-0 left-0 right-0 z-30 p-4 rounded-lg"
        ref={containerRef}
      >
        {/* 検索フォーム */}
        <div className="flex flex-col">
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="ゲームタイトルを検索"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              className={`w-full p-2 pr-8 text-black border-2 border-gray-200 focus:outline-none transition duration-300 ease-in-out ${
                isFocused && searchQuery !== "" && filteredSteamList.length > 0
                  ? "rounded-t-lg"
                  : "rounded-lg"
              }`}
            />
            {selectedIndex !== -1 && (
              <button
                onClick={handleClose}
                className="absolute right-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label="閉じる"
              >
                ×
              </button>
            )}
          </div>

          {/* メッセージ表示エリア */}
          {showNoResultsMessage && (
            <p className="text-gray-300 mt-1">
              該当するゲームが見つかりません。別のゲームをお探しください。
            </p>
          )}

          {/* ゲーム追加候補表示 */}
          {isFocused && searchQuery !== "" && filteredSteamList.length > 0 && (
            <div className="bg-white text-black rounded-b-lg max-h-60 overflow-y-auto cursor-pointer">
              {filteredSteamList.map((game) => (
                <div key={"filteredSteamList" + game.steamGameId}>
                  {typeof game.index === "number" ? (
                    <div
                      className="cursor-pointer flex items-center hover:bg-gray-400 px-2"
                      onClick={() => {
                        if (game.index !== undefined) {
                          setSelectedIndex(game.index);
                          setSearchQuery(game.title); // 選択したゲームのタイトルを設定
                          setIsFocused(false); // 候補を非表示にする
                        }
                      }}
                    >
                      {/* 左側の順位 */}
                      <div
                        className="text-center"
                        style={{
                          minWidth: "40px", // 固定幅を指定して左揃えを実現
                        }}
                      >
                        {game.index + 1}位
                      </div>
                      {/* 右側のタイトル */}
                      <div className="p-2">{game.title}</div>
                    </div>
                  ) : (
                    <div
                      className="flex items-center hover:bg-gray-400 px-2"
                      onClick={() => {
                        handleSearchClick(game.steamGameId);
                        setIsFocused(false); // 候補を非表示にする
                      }}
                    >
                      {/* 左側のアイコン */}
                      <div
                        style={{
                          minWidth: "40px", // 左揃え用の固定幅
                          display: "flex",
                          justifyContent: "center", // アイコンを中央揃え
                        }}
                      >
                        <PlaylistAddIcon className="cursor-pointer hover:bg-gray-600 rounded" />
                      </div>
                      {/* 右側のタイトル */}
                      <div className="p-2">{game.title}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 選択されたゲームの詳細表示 */}
      {selectedIndex !== -1 && nodes[selectedIndex] ? (
        <div className="rounded-lg mt-24" ref={selectedDetailRef}>
          {/* ゲーム詳細内容 */}
          <div className="flex flex-col space-y-2">
            {/* ゲーム画像 */}
            {nodes[selectedIndex].imgURL && (
              <Image
                src={nodes[selectedIndex].imgURL}
                alt={nodes[selectedIndex].title}
                width={600}
                height={400}
                style={{ borderRadius: "4px" }}
                className="object-cover rounded mb-2"
              />
            )}
            <div className="px-2">
              <div className="flex">
                {/*flexデバッグ用 */}
                <h2 className="text-white text-xl font-semibold">
                  {nodes[selectedIndex].title}
                </h2>

                {/* Steamアイコンリンク */}
                <Tooltip title="Steamで開く">
                  <Link
                    href={`https://store.steampowered.com/app/${nodes[selectedIndex].steamGameId}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-blue-400"
                  >
                    <OpenInNewIcon fontSize="small" />
                  </Link>
                </Tooltip>
              </div>
              
              <div>
                {nodes[selectedIndex].shortDetails && (
                  <div className="text-white text-sm mt-1">
                    {nodes[selectedIndex].shortDetails}
                  </div>
                )}
              </div>

              {/* タグ */}
              <div className="text-white">
                {nodes[selectedIndex].tags &&
                  nodes[selectedIndex].tags.length > 0 && (
                    <div className="line-clamp-2 overflow-hidden">
                      {nodes[selectedIndex].tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-green-500 text-xs p-0.5 mr-1 mb-1 rounded inline-block whitespace-nowrap select-none cursor-pointer"
                          onClick={() => addSelectedTags(tag)}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
              </div>

            </div>
          </div>
          <ReviewCloud steamData={steamAllData[selectedIndex]} />
          <Popularity nodes={nodes} selectedIndex={selectedIndex} />
        </div>
      ) : (
        <div className="text-white text-center pt-24">
          ゲームを選択してください。
        </div>
      )}
    </div>
  );
};

export default GameSearchPanel;
