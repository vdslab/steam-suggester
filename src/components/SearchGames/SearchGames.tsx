
import { useEffect, useState } from "react";
import { changeGameIdData } from "@/hooks/indexedDB";
import { SteamListType, NodeType } from "@/types/NetworkType";
import SearchItemManager from "./SearchItemManager";

import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import SearchIcon from "@mui/icons-material/Search";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import { IconButton } from "@mui/material";

type SearchGamesProps = {
  setSelectedIndex: (value: number) => void;
  userAddedGames: string[];
  setUserAddedGames: (value: string[]) => void;
  nodes: NodeType[];
  setIsNetworkLoading: (value: boolean) => void;
  steamListData: SteamListType[];
  openPanel: string | null;
};


const SearchGames = ({
    setSelectedIndex,
    userAddedGames,
    setUserAddedGames,
    nodes,
    setIsNetworkLoading,
    steamListData,
    openPanel,
}: SearchGamesProps) => {

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredSteamList, setFilteredSteamList] = useState<SteamListType[]>([]);
  const [isFocused, setIsFocused] = useState<boolean>(false);

  // 外部クリックを検出してフォーカスを解除
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const searchContainer = document.getElementById("search-container");
      if (searchContainer && !searchContainer.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 検索ロジック
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
      .filter((game) => game.title !== "Apex")
    );

    const filteredSteam = allSteamList
      .filter(
        (game) =>
          game.title.toLowerCase().includes(lowerCaseQuery) && game.steamGameId
      )
      .slice(0, 20);

    setFilteredSteamList(filteredSteam);
  }, [searchQuery, userAddedGames, nodes, steamListData]);

  // ゲームを追加する処理
  const handleGameAdd= (steamGameId: string) => {
    if (
      !userAddedGames.includes(steamGameId) &&
      !nodes.some((node:any) => node.steamGameId === steamGameId)
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

  const handleGameSelect = (game: SteamListType) => {
    if (game.index !== undefined) {
      setSelectedIndex(game.index);
      setSearchQuery(game.title);
      setIsFocused(false);
    }
  }


  return (
    <div
      id="search-container"
      className={`absolute top-4 left-0 z-30 py-2 rounded-lg backdrop-filter backdrop-blur-sm transition-all duration-300 ${
        openPanel != null ? "ml-72" : "ml-8" // Sidebarの幅に応じてマージンを変更
      }`}
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
            className={`w-full p-2 pl-8 text-black border-2 border-gray-200 focus:outline-none transition duration-300 ease-in-out ${
              isFocused &&
              searchQuery !== "" &&
              filteredSteamList.length > 0
                ? "rounded-t-lg"
                : "rounded-lg"
            }`}
          />
          <SearchIcon className="absolute left-2 text-gray-500" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label="クリア検索"
            >
              ×
            </button>
          )}
        </div>

        {/* メッセージ表示エリア */}
        {searchQuery !== "" && filteredSteamList.length === 0 && (
          <p className="text-gray-300 mt-1">
            該当するゲームが見つかりません。別のゲームをお探しください。
          </p>
        )}

        {/* ゲーム追加候補表示 */}
        {isFocused &&
          searchQuery !== "" &&
          filteredSteamList.length > 0 && (
            <div className="bg-white text-black rounded-b-lg max-h-60 overflow-y-auto cursor-pointer">
              {filteredSteamList.map((game:SteamListType) => (
                <div key={"filteredSteamList" + game.steamGameId}>
                  {typeof game.index === "number" ? (
                    <SearchItemManager
                      game={game}
                      handleSelectGame={handleGameSelect}
                      handleDeleteGame={handleGameDelete}
                      setIsFocused={setIsFocused}
                      startIcon={`${game.index + 1}位`}
                      endIcon={userAddedGames.includes(game.steamGameId) ? <IconButton><DeleteForeverOutlinedIcon /></IconButton> : null}
                    />
                  ) : (
                    <SearchItemManager
                      game={game}
                      handleAddGame={handleGameAdd}
                      setIsFocused={setIsFocused}
                      startIcon={<PlaylistAddIcon />}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  )
}

export default SearchGames