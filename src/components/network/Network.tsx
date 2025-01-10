/* Network.tsx */
"use client";
import { useEffect, useState, useRef } from "react";
import NodeLink from "./NodeLink";
import SelectParameter from "./selectParameter/SelectParameter";
import { DEFAULT_FILTER, DEFAULT_SLIDER } from "@/constants/DEFAULT_FILTER";
import { Filter, SliderSettings } from "@/types/api/FilterType";
import StreamedList from "./streamedList/StreamedList";
import createNetwork from "@/hooks/createNetwork";
import Loading from "@/app/loading";
import {
  LinkType,
  NodeType,
  SteamListType,
  StreamerListType,
} from "@/types/NetworkType";
import {
  getFilterData,
  getGameIdData,
  getSliderData,
  changeGameIdData,
} from "@/hooks/indexedDB";
import Sidebar from "./Sidebar";
import LiveTvIcon from "@mui/icons-material/LiveTv";
import Panel from "./Panel";
import SteamList from "./steamList/SteamList";
import HelpTooltip from "./HelpTooltip";
import Tour from "./Tour";
import ProgressBar from "./ProgressBar";
import TuneIcon from "@mui/icons-material/Tune";
import Leaderboard from "./Leaderboard";
import GameDetailPanel from "./gameDetail/gameDetail";
import useTour from "@/hooks/useTour";
import { SteamDetailsDataType } from "@/types/api/getSteamDetailType";
import UserAvatar from "./steamList/UserAvatar";
import { HomeHeader } from "../common/Headers";
import HighlightPanel from "./highlight/HighlightPanel";

import SearchIcon from "@mui/icons-material/Search";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import SimilaritySettings from "./similaritySettings/SimilaritySettings";


type Props = {
  steamAllData: SteamDetailsDataType[];
  steamListData: SteamListType[];
};

const Network = (props: Props) => {
  const { steamAllData, steamListData } = props;

  const [filter, setFilter] = useState<Filter>(DEFAULT_FILTER);
  const [slider, setSlider] = useState<SliderSettings>(DEFAULT_SLIDER);

  const [nodes, setNodes] = useState<NodeType[]>([]);
  const [links, setLinks] = useState<LinkType[]>([]);
  const [centerX, setCenterX] = useState<number>(0);
  const [centerY, setCenterY] = useState<number>(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const [isNetworkLoading, setIsNetworkLoading] = useState(true);

  const [streamerIds, setStreamerIds] = useState<StreamerListType[]>([]);

  // openPanelを他のパネルのみに使用
  const [openPanel, setOpenPanel] = useState<string | null>(null);
  // GameSearchPanel専用の状態
  const [isGameSearchOpen, setIsGameSearchOpen] = useState<boolean>(false);

  const { tourRun, setTourRun } = useTour();

  const [progress, setProgress] = useState(0);

  // Sidebarが開いているかどうかを管理する状態
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Refを使用して副作用の実行を制御
  const hasFetchedInitialData = useRef(false);

  // 検索関連の状態
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredSteamList, setFilteredSteamList] = useState<SteamListType[]>(
    []
  );
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [userAddedGames, setUserAddedGames] = useState<string[]>([]);

  const initialNodes = async (
    filter: Filter,
    gameIds: string[],
    slider: SliderSettings
  ) => {
    setProgress(0);
    const result = await createNetwork(
      steamAllData,
      filter,
      gameIds,
      slider
    );
    const nodes = result?.nodes ?? [];
    const links = result?.links ?? [];
    const buffNodes = nodes.concat();
    buffNodes.sort(
      (node1: NodeType, node2: NodeType) =>
        (node2.circleScale ?? 0) - (node1.circleScale ?? 0)
    );
    if (buffNodes.length > 0) {
      setCenterX((buffNodes[0]?.x ?? 0) - 150);
      setCenterY((buffNodes[0]?.y ?? 0) + 100);
      setSelectedIndex(-1);
    }
    setNodes(nodes);
    setLinks(links);
    hasFetchedInitialData.current = false; 
  };

  useEffect(() => {
    if (isNetworkLoading && !hasFetchedInitialData.current) {
      hasFetchedInitialData.current = true; // フラグを立てる
      (async () => {
        const filterData = (await getFilterData()) ?? DEFAULT_FILTER;
        const gameIds = (await getGameIdData()) ?? [];
        const sliderData = (await getSliderData()) ?? DEFAULT_SLIDER;
        setFilter(filterData);
        setSlider(sliderData);
        await initialNodes(filterData, gameIds, sliderData);
        setIsNetworkLoading(false);
      })();
    }
  }, [isNetworkLoading]);

  // 選択されたノードが変更されたときに中心座標を更新
  useEffect(() => {
    if (selectedIndex !== -1 && nodes[selectedIndex]) {
      setCenterX((nodes[selectedIndex].x ?? 0) - 150);
      setCenterY((nodes[selectedIndex].y ?? 0) + 100);
      // ノードが選択されたら GameSearchPanel を開く
      setIsGameSearchOpen(true);
    }
  }, [selectedIndex]);

  const togglePanel = (panelName: string) => {
    setOpenPanel((prevPanel) => {
      const newPanel = prevPanel === panelName ? null : panelName;
      setIsSidebarOpen(newPanel !== null); // Sidebarが開いているかどうかを更新
      return newPanel;
    });
    setTourRun(false);
  };

  const toggleTourRun = () => {
    setTourRun((prev) => {
      const newState = !prev;
      if (newState) {
        setOpenPanel(null);
        setIsGameSearchOpen(false); // ツアー開始時に GameSearchPanel も閉じる
      }
      return newState;
    });
  };

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
    );

    const filteredSteam = allSteamList
      .filter(
        (game) =>
          game.title.toLowerCase().includes(lowerCaseQuery) && game.steamGameId
      )
      .slice(0, 20);

    setFilteredSteamList(filteredSteam);
  }, [searchQuery, userAddedGames, nodes, steamListData]);

  // ユーザーが追加したゲームを取得
  useEffect(() => {
    (async () => {
      const res = await getGameIdData();
      setUserAddedGames(res ?? []);
    })();
  }, []);

  // ゲームを追加する処理
  const handleSearchClick = (steamGameId: string) => {
    if (
      !userAddedGames.includes(steamGameId) &&
      !nodes.some((node) => node.steamGameId === steamGameId)
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

  if (isNetworkLoading) {
    return <Loading />;
  }

  return (
    <div className="flex flex-1 overflow-hidden text-white relative">
      {/* Sidebar */}
      <Sidebar
        openPanel={openPanel}
        togglePanel={togglePanel}
        tourRun={tourRun}
        toggleTourRun={toggleTourRun}
      />

      {/* メインコンテンツ */}
      <div className="flex-1 relative bg-gray-900 overflow-hidden z-10">
        <HomeHeader />

        {/* 検索バー */}
        <div
          id="search-container"
          className={`absolute top-4 left-0 z-30 py-2 rounded-lg backdrop-filter backdrop-blur-sm transition-all duration-300 ${
            isSidebarOpen ? "ml-72" : "ml-8" // Sidebarの幅に応じてマージンを変更
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
                  {filteredSteamList.map((game) => (
                    <div key={"filteredSteamList" + game.steamGameId}>
                      {typeof game.index === "number" ? (
                        <div
                          className="cursor-pointer flex items-center hover:bg-gray-400 px-2"
                          onClick={() => {
                            if (game.index !== undefined) {
                              setSelectedIndex(game.index);
                              setSearchQuery(game.title);
                              setIsFocused(false);
                              setIsGameSearchOpen(true);
                            }
                          }}
                        >
                          <div
                            className="text-center"
                            style={{
                              minWidth: "40px",
                            }}
                          >
                            {game.index + 1}位
                          </div>
                          <div className="p-2">{game.title}</div>
                        </div>
                      ) : (
                        <div
                          className="flex items-center hover:bg-gray-400 px-2"
                          onClick={() => {
                            handleSearchClick(game.steamGameId);
                            setIsFocused(false);
                          }}
                        >
                          <div
                            style={{
                              minWidth: "40px",
                              display: "flex",
                              justifyContent: "center",
                            }}
                          >
                            <PlaylistAddIcon className="cursor-pointer hover:bg-gray-600 rounded" />
                          </div>
                          <div className="p-2">{game.title}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
          </div>
        </div>

        {/* ゲーム詳細表示 */}
        {selectedIndex !== -1 && nodes[selectedIndex] && isGameSearchOpen && (
          <div className="absolute top-0 right-0 w-1/4 z-20 h-full">
            <GameDetailPanel
              nodes={nodes}
              selectedIndex={selectedIndex}
              setSelectedIndex={setSelectedIndex}
              setIsNetworkLoading={setIsNetworkLoading}
              steamListData={steamListData}
              setOpenPanel={setOpenPanel}
              selectedTags={selectedTags}
              setSelectedTags={setSelectedTags}
            />
          </div>
        )}

        {!isNetworkLoading ? (
          <div className="absolute inset-0">
            <div className="absolute top-0 right-4 z-10">
              {/* ユーザーアイコン */}
              <UserAvatar />
            </div>
            <NodeLink
              nodes={nodes}
              links={links}
              centerX={centerX}
              centerY={centerY}
              selectedIndex={selectedIndex}
              setSelectedIndex={setSelectedIndex}
              streamerIds={streamerIds}
              openPanel={openPanel}
              selectedTags={selectedTags}
            />
          </div>
        ) : (
          <ProgressBar progress={0} />
        )}

        {/* フィルターパネル */}
        {openPanel === "filter" && (
          <div className="absolute top-0 left-0 w-1/5 h-full bg-gray-900 overflow-y-auto overflow-x-hidden shadow-lg z-10 transition-transform duration-300">
            <SelectParameter
              filter={filter}
              setFilter={setFilter}
              setIsNetworkLoading={setIsNetworkLoading}
            />
          </div>
        )}
        {/* 強調表示パネル */}
        {openPanel === "highlight" && (
          <div className="absolute top-0 left-0 w-1/5 h-full bg-gray-900 overflow-y-auto overflow-x-hidden shadow-lg z-10 transition-transform duration-300">
            <HighlightPanel selectedTags={selectedTags} setSelectedTags={setSelectedTags}/>
          </div>
        )}

        {/* StreamerListパネル */}
        {openPanel === "streamer" && (
          <div className="absolute top-0 left-0 w-1/5 h-full bg-transparent overflow-y-auto overflow-x-hidden shadow-lg z-10 transition-transform duration-300">
            <Panel
              title={
                <div className="flex items-center">
                  <span>配信者</span>
                  <HelpTooltip title="配信者を追加すると配信者が配信したゲームのアイコンに枠が表示されます。また、アイコンをクリックすると配信者のページに飛べます" />
                </div>
              }
              icon={<LiveTvIcon className="mr-2 text-white" />}
            >
              <StreamedList
                nodes={nodes}
                streamerIds={streamerIds}
                setStreamerIds={setStreamerIds}
              />
            </Panel>
          </div>
        )}

        {/* 類似度 */}
        {openPanel === "similarity" && (
          <div className="absolute top-0 left-0 w-1/5 h-full bg-transparent overflow-y-auto overflow-x-hidden shadow-lg z-10 transition-transform duration-300">
            <Panel
              title={
                <div className="flex items-center">
                  <span>類似度設定</span>
                  <HelpTooltip title="ゲーム間の類似度計算における重みを調整できます。" />
                </div>
              }
              icon={<TuneIcon className="mr-2 text-white" />}
            >
              <SimilaritySettings
                slider={slider}
                setSlider={setSlider}
                setIsNetworkLoading={setIsNetworkLoading}
              />
            </Panel>
          </div>
        )}

        {/* Steam連携パネル */}
        {openPanel === "steamList" && (
          <div className="absolute top-0 left-0 w-1/5 h-full bg-gray-900 overflow-y-auto overflow-x-hidden shadow-lg z-10 transition-transform duration-300">
            <SteamList
              steamAllData={steamAllData}
              nodes={nodes}
              setSelectedIndex={setSelectedIndex}
            />
          </div>
        )}

        {/* ランキングパネル */}
        {openPanel === "ranking" && (
          <div className="absolute top-0 left-0 w-1/5 h-full bg-gray-900 overflow-y-auto overflow-x-hidden shadow-lg z-10 transition-transform duration-300">
            <Leaderboard nodes={nodes} setSelectedIndex={setSelectedIndex} />
          </div>
        )}

        {/* Tourコンポーネント */}
        <Tour run={tourRun} setRun={setTourRun} />
      </div>
    </div>
  );
};

export default Network;
