/* GameSearchPanel.tsx */
"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { changeGameIdData, getGameIdData } from "@/hooks/indexedDB";
import { NodeType, SteamListType } from "@/types/NetworkType";
import Image from "next/image";
import { useRouter } from "next/navigation";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import Section from "./Section";
import HelpTooltip from "./HelpTooltip";
import AppleIcon from "@mui/icons-material/Apple";
import PersonIcon from "@mui/icons-material/Person";
import GroupIcon from "@mui/icons-material/Group";
import Tooltip from "@mui/material/Tooltip";
import WindowsIcon from "@/components/common/WindowsIcon";
import ToggleDisplay from "./ToggleDisplay";

type Props = {
  nodes: NodeType[];
  selectedIndex: number;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
  setIsNetworkLoading: React.Dispatch<React.SetStateAction<boolean>>;
  steamListData: SteamListType[];
};

const GameSearchPanel = (props: Props) => {
  const {
    steamListData,
    nodes,
    selectedIndex,
    setSelectedIndex,
    setIsNetworkLoading,
  } = props;
  const router = useRouter();
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

  return (
    <div className="flex-1 bg-gray-800 rounded-l-lg p-0 shadow-md flex flex-col space-y-0 h-full relative">
      {/* ヘッダー */}
      {/* <div className="flex items-center space-x-2 mb-0">
        <SearchIcon className="text-white" />
        <div className="flex items-center">
          <span className="text-white text-lg font-semibold">ゲーム検索</span>
          <HelpTooltip title="ゲームを検索して追加できます。検索結果からゲームを選択すると詳細が表示されます。" />
        </div>
      </div> */}

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
              className="w-full p-2 pr-8 text-black rounded border-2 border-gray-300 focus:outline-none focus:border-blue-500 transition duration-300 ease-in-out"
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
            <div className="bg-white text-black p-2 rounded-b-lg max-h-60 overflow-y-auto mt-0 cursor-pointer">
              {/* <h2 className="text-white mb-2">検索結果（追加候補）</h2> */}
              {filteredSteamList.map((game) => (
                <div key={"filteredSteamList" + game.steamGameId}>
                  {typeof game.index === "number" ? (
                    <div
                      className="cursor-pointer flex items-center"
                      onMouseDown={() =>
                        game.index !== undefined && setSelectedIndex(game.index)
                      }
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
                    <div className="flex items-center">
                      {/* 左側のアイコン */}
                      <div
                        style={{
                          minWidth: "40px", // 左揃え用の固定幅
                          display: "flex",
                          justifyContent: "center", // アイコンを中央揃え
                        }}
                      >
                        <PlaylistAddIcon
                          className="cursor-pointer hover:bg-gray-600 rounded"
                          onMouseDown={() =>
                            handleSearchClick(game.steamGameId)
                          }
                        />
                      </div>
                      {/* 右側のタイトル */}
                      <div className="p-2 rounded">{game.title}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 選択されたゲームの詳細表示 */}
      {selectedIndex !== -1 && nodes[selectedIndex] && (
        <div className="rounded-lg mt-24" ref={selectedDetailRef}>
          {/* ゲーム詳細内容 */}
          <div className="flex flex-col space-y-2">
            {/* ゲーム画像 */}
            {nodes[selectedIndex].imgURL && (
              <Image
                src={nodes[selectedIndex].imgURL}
                alt={nodes[selectedIndex].title}
                width={400}
                height={170}
                style={{ borderRadius: "4px" }}
                className="object-cover rounded mb-2"
              />
            )}
            <div className="px-2">
              <h2 className="text-white text-xl font-semibold">
                {nodes[selectedIndex].title}
              </h2>

              {/* ジャンル */}
              {nodes[selectedIndex].genres &&
                nodes[selectedIndex].genres.length > 0 && (
                  <div className="flex items-center space-x-0.5 flex-wrap">
                    {nodes[selectedIndex].genres.map((genre, index) => (
                      <span
                        key={index}
                        className="bg-blue-500 text-xs p-0.5 mr-1 mt-1 mb-1 rounded flex-shrink-0 cursor-pointer select-none"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                )}

              {/* タグ */}
              <div className="text-white">
                {nodes[selectedIndex].tags &&
                  nodes[selectedIndex].tags.length > 0 && (
                    <div className="line-clamp-2 overflow-hidden">
                      {nodes[selectedIndex].tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-green-500 text-xs p-0.5 mr-1 mb-1 rounded inline-block whitespace-nowrap cursor-pointer select-none"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
              </div>

              {/* アイコン表示 */}
              <div className="flex items-center space-x-1 mt-1 mb-2">
                {/* デバイスサポート */}
                {nodes[selectedIndex].device.windows && (
                  <Tooltip title="Windows対応">
                    <WindowsIcon size={20} />
                  </Tooltip>
                )}
                {nodes[selectedIndex].device.mac && (
                  <Tooltip title="Mac対応">
                    <AppleIcon className="text-white h-5 w-5" />
                  </Tooltip>
                )}

                {/* マルチプレイヤー情報 */}
                {nodes[selectedIndex].isSinglePlayer && (
                  <Tooltip title="Single Player">
                    <PersonIcon className="text-white h-5 w-5" />
                  </Tooltip>
                )}
                {nodes[selectedIndex].isMultiPlayer && (
                  <Tooltip title="Multiplayer">
                    <GroupIcon className="text-white h-5 w-5" />
                  </Tooltip>
                )}
              </div>

              {/* Developer & Release Date */}
              <div className="flex items-center">
                <span className="text-sm mb-1">
                  開発者: {nodes[selectedIndex].developerName}
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-sm mb-1">
                  発売日: {nodes[selectedIndex].releaseDate}
                </span>
              </div>

              {/* 価格 */}
              <div className="flex items-center">
                <div>価格: </div>
                {nodes[selectedIndex].salePrice &&
                parseInt(nodes[selectedIndex].salePrice, 10) <
                  nodes[selectedIndex].price ? (
                  <>
                    <span className="line-through text-gray-400 ml-2">
                      ¥{nodes[selectedIndex].price}
                    </span>
                    <span className="text-red-500 ml-2">
                      ¥{nodes[selectedIndex].salePrice}
                    </span>
                  </>
                ) : (
                  <span className="text-sm ml-2">
                    {nodes[selectedIndex].price
                      ? `¥${nodes[selectedIndex].price}`
                      : "無料"}
                  </span>
                )}
              </div>

              {/* アクションボタン */}
              {/* <div className="mt-4 flex space-x-2">
              <button
                className="bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded"
                onClick={() =>
                  router.push(
                    `/desktop/details?steam_id=${nodes[selectedIndex].steamGameId}&twitch_id=${nodes[selectedIndex].twitchGameId}`
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
            </div> */}
            </div>
          </div>
        </div>
      )}

      {/* トグル表示 */}
      <ToggleDisplay nodes={nodes} selectedIndex={selectedIndex} />
    </div>
  );
};

export default GameSearchPanel;
