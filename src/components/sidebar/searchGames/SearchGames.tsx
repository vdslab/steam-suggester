import { useEffect, useState, useMemo } from "react";
import { changeGameIdData, getGameIdData } from "@/hooks/indexedDB";
import { SteamListType, NodeType } from "@/types/NetworkType";
import SearchItemManager from "./SearchItemManager";

import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import SearchIcon from "@mui/icons-material/Search";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import { IconButton } from "@mui/material";
import useScreenSize from "@visx/responsive/lib/hooks/useScreenSize";
import { startsWithPanelList } from "@/components/common/Utils";

type SearchGamesProps = {
  setSelectedIndex: (value: number) => void;
  nodes: NodeType[];
  setIsNetworkLoading: (value: boolean) => void;
  steamListData: SteamListType[];
  openPanel: string | null;
  setPrevAddedGameId: React.Dispatch<React.SetStateAction<string>>;
};

const SearchGames = ({
  setSelectedIndex,
  nodes,
  setIsNetworkLoading,
  steamListData,
  openPanel,
  setPrevAddedGameId,
}: SearchGamesProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredSteamList, setFilteredSteamList] = useState<SteamListType[]>([]);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [addedGameIds, setAddedGameIds] = useState<string[]>([]);

  const { width, height } = useScreenSize({ debounceTime: 150 });


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

  useEffect(() => {
    const fetchGameIds = async () => {
      const addedGameIds = await getGameIdData();
      setAddedGameIds(addedGameIds ?? []);
    };
    fetchGameIds();
  }, [nodes]);

  // allSteamList を効率的に作成
  const allSteamList = useMemo(() => {
    const steamMap = new Map<string, SteamListType>();

    // nodes を優先して追加
    nodes.forEach((node: NodeType) => {
      steamMap.set(node.steamGameId, {
        steamGameId: node.steamGameId,
        title: node.title,
        index: node.index,
      });
    });

    // steamListData を追加（重複は自動的に排除される）
    steamListData.forEach((item: SteamListType) => {
      if (!steamMap.has(item.steamGameId)) {
        steamMap.set(item.steamGameId, item);
      }
    });

    return Array.from(steamMap.values());
  }, [nodes, steamListData]);

  // 検索ロジックを useMemo に移動
  const filteredSteam = useMemo(() => {
    if (!searchQuery) return [];
    const lowerCaseQuery = searchQuery.toLowerCase();
    return allSteamList
      .filter(
        (game) =>
          game.title.toLowerCase().includes(lowerCaseQuery) && game.steamGameId
      )
      .slice(0, 20);
  }, [searchQuery, allSteamList]);

  // filteredSteamList を setState する useEffect を単純化
  useEffect(() => {
    setFilteredSteamList(filteredSteam);
  }, [filteredSteam]);

  // ゲームを追加する処理
  const handleGameAdd = (steamGameId: string) => {
    if (
      !addedGameIds.includes(steamGameId) &&
      !nodes.some((node: NodeType) => node.steamGameId === steamGameId)
    ) {
      const newUserAddedGames = [...addedGameIds, steamGameId];
      setSearchQuery("");
      (async () => {
        await changeGameIdData(newUserAddedGames);
        setPrevAddedGameId(steamGameId);
      })();
    }
  };

  // ゲームを削除する処理
  const handleGameDelete = (steamGameId: string) => {
    const newUserAddedGames = addedGameIds.filter(
      (gameId: string) => gameId !== steamGameId
    );
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
  };

  if (width < 1024 && startsWithPanelList(openPanel)) {
    return null;
  }

  return (
    <div
      id="search-container"
      className={`absolute z-30 py-2 rounded-lg transition-all duration-300 ease-in-out top-12 lg:top-4`}
      style={{
        marginLeft: startsWithPanelList(openPanel) ? "calc(20% + 1rem)" : "1rem", // Sidebarの幅に応じてマージンを変更
      }}
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
              isFocused && searchQuery !== "" && filteredSteamList.length > 0
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
        {isFocused && searchQuery !== "" && filteredSteamList.length > 0 && (
          <div className="bg-white text-black rounded-b-lg max-h-60 overflow-y-auto cursor-pointer">
            {filteredSteamList.map((game: SteamListType) => (
              <div key={"filteredSteamList" + game.steamGameId}>
                {typeof game.index === "number" ? (
                  <SearchItemManager
                    game={game}
                    handleSelectGame={handleGameSelect}
                    handleDeleteGame={handleGameDelete}
                    setIsFocused={setIsFocused}
                    startIcon={`${game.index + 1}位`}
                    endIcon={
                      addedGameIds.includes(game.steamGameId) ? (
                        <IconButton>
                          <DeleteForeverOutlinedIcon />
                        </IconButton>
                      ) : null
                    }
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
  );
};

export default SearchGames;
