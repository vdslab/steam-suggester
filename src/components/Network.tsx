"use client";
import { useEffect, useState } from "react";
import NodeLink from "./nodelink/NodeLink";
import SelectParameter from "./sidebar/selectParameter/SelectParameter";
import { DEFAULT_FILTER, DEFAULT_SLIDER } from "@/constants/DEFAULT_FILTER";
import { Filter, SliderSettings } from "@/types/api/FilterType";
import StreamedList from "./sidebar/streamedList/StreamedList";
import createNetwork from "@/hooks/createNetwork";
import Loading from "@/app/loading";
import Error from "@/app/error";
import {
  LinkType,
  NodeType,
  SteamListType,
  StreamerListType,
} from "@/types/NetworkType";
import { getFilterData, getGameIdData, getSliderData } from "@/hooks/indexedDB";
import Sidebar from "./sidebar/Sidebar";
import LiveTvIcon from "@mui/icons-material/LiveTv";
import Panel from "./common/Panel";
import SteamList from "./sidebar/steamList/SteamList";
import HelpTooltip from "./common/HelpTooltip";
import Tour from "./tutorial/Tour";
import ProgressBar from "./common/ProgressBar";
import TuneIcon from "@mui/icons-material/Tune";
import Leaderboard from "./sidebar/leaderboard/Leaderboard";
import useTour from "@/hooks/useTour";
import { SteamDetailsDataType } from "@/types/api/getSteamDetailType";
import { HomeHeader } from "./common/Headers";
import HighlightPanel from "./sidebar/highlight/HighlightPanel";
import SimilaritySettings from "./sidebar/similaritySettings/SimilaritySettings";
import { fetcher } from "./common/Fetcher";
import useSWR from "swr";
import SearchGames from "./sidebar/searchGames/SearchGames";
import GameDetail from "./detail/GameDetail";
import Tutorial from "./tutorial/Tutorial";
import { CACHE_UPDATE_EVERY_24H } from "@/constants/USE_SWR_OPTION";

const Network = () => {

  const { data: steamAllData, error: steamAllDataError } = useSWR<SteamDetailsDataType[]>(
    `${process.env.NEXT_PUBLIC_CURRENT_URL}/api/network/getMatchGames`,
    fetcher,
    CACHE_UPDATE_EVERY_24H
  );
  const { data: steamListData, error: steamListDataError } = useSWR<SteamListType[]>(
    `${process.env.NEXT_PUBLIC_CURRENT_URL}/api/network/getMatchGames`,
    fetcher,
    CACHE_UPDATE_EVERY_24H
  );

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

  const [userAddedGames, setUserAddedGames] = useState<string[]>([]);

  const [prevAddedGameId, setPrevAddedGameId] = useState<string>("");

  const initialNodes = async (
    filter: Filter,
    gameIds: string[],
    slider: SliderSettings
  ) => {
    const result = await createNetwork(steamAllData, filter, gameIds, slider);
    const nodes = result?.nodes ?? [];
    const links = result?.links ?? [];
    const buffNodes = nodes.concat();
    buffNodes.sort(
      (node1: NodeType, node2: NodeType) =>
        (node2.circleScale ?? 0) - (node1.circleScale ?? 0)
    );
    const index = buffNodes.findIndex(
      (node: NodeType) => node.steamGameId === prevAddedGameId
    );
    if (buffNodes.length > 0 && index === -1) {
      setCenterX((buffNodes[0]?.x ?? 0) - 150);
      setCenterY((buffNodes[0]?.y ?? 0) + 100);
      setSelectedIndex(-1);
    } else if (index !== -1) {
      setCenterX((buffNodes[index]?.x ?? 0) - 150);
      setCenterY((buffNodes[index]?.y ?? 0) + 100);
      setSelectedIndex(index);
    }
    setPrevAddedGameId("");
    setNodes(nodes);
    setLinks(links);
  };

  useEffect(() => {
    if (prevAddedGameId) {
      setIsNetworkLoading(true);
    }
  }, [prevAddedGameId]);

  useEffect(() => {
    if (isNetworkLoading && steamAllData) {
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
  }, [isNetworkLoading, steamAllData]);

  // 選択されたノードが変更されたときに中心座標を更新
  useEffect(() => {
    if (selectedIndex !== -1 && nodes[selectedIndex]) {
      setCenterX((nodes[selectedIndex].x ?? 0) - 150);
      setCenterY((nodes[selectedIndex].y ?? 0) + 100);
      setIsGameSearchOpen(true);
    }
  }, [selectedIndex]);

  const togglePanel = (panelName: string) => {
    setOpenPanel((prevPanel) => {
      const newPanel = prevPanel === panelName ? null : panelName;
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

  // ユーザーが追加したゲームを取得
  useEffect(() => {
    (async () => {
      const res = await getGameIdData();
      setUserAddedGames(res ?? []);
    })();
  }, []);

  if (isNetworkLoading || !steamAllData || !steamListData) {
    return <Loading />;
  }

  if (steamAllDataError || steamListDataError) {
    return <Error error={steamAllDataError || steamListDataError} reset={() => setIsNetworkLoading(true)} />;
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

        <SearchGames
          setSelectedIndex={setSelectedIndex}
          userAddedGames={userAddedGames}
          setUserAddedGames={setUserAddedGames}
          nodes={nodes}
          setIsNetworkLoading={setIsNetworkLoading}
          steamListData={steamListData}
          openPanel={openPanel}
          setPrevAddedGameId={setPrevAddedGameId}
        />

        {/* ゲーム詳細表示 */}
        {selectedIndex !== -1 && nodes[selectedIndex] && isGameSearchOpen && (
          <div className="absolute top-0 right-0 w-1/4 z-20 h-full">
            <GameDetail
              nodes={nodes}
              selectedIndex={selectedIndex}
              setSelectedIndex={setSelectedIndex}
              setOpenPanel={setOpenPanel}
              selectedTags={selectedTags}
              setSelectedTags={setSelectedTags}
            />
          </div>
        )}

        {!isNetworkLoading ? (
          <div className="absolute inset-0">
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
        <div
          className={`absolute top-0 left-0 w-1/5 h-full bg-gray-900 overflow-y-auto overflow-x-hidden shadow-lg z-10 transition-transform duration-300 transform ${
            openPanel === "filter"
              ? "translate-x-0"
              : openPanel === null
              ? "-translate-x-full"
              : "hidden"
          }`}
        >
          <SelectParameter
            filter={filter}
            setFilter={setFilter}
            setIsNetworkLoading={setIsNetworkLoading}
          />
        </div>

        {/* 強調表示パネル */}
        <div
          className={`absolute top-0 left-0 w-1/5 h-full bg-gray-900 overflow-y-auto overflow-x-hidden shadow-lg z-10 transition-transform duration-300 transform ${
            openPanel === "highlight"
              ? "translate-x-0"
              : openPanel === null
              ? "-translate-x-full"
              : "hidden"
          }`}
        >
          <HighlightPanel
            selectedTags={selectedTags}
            setSelectedTags={setSelectedTags}
          />
        </div>

        {/* StreamerListパネル */}
        <div
          className={`absolute top-0 left-0 w-1/5 h-full bg-transparent overflow-y-auto overflow-x-hidden shadow-lg z-10 transition-transform duration-300 transform ${
            openPanel === "streamer"
              ? "translate-x-0"
              : openPanel === null
              ? "-translate-x-full"
              : "hidden"
          }`}
        >
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

        {/* 類似度パネル */}
        <div
          className={`absolute top-0 left-0 w-1/5 h-full bg-transparent overflow-y-auto overflow-x-hidden shadow-lg z-10 transition-transform duration-300 transform ${
            openPanel === "similarity"
              ? "translate-x-0"
              : openPanel === null
              ? "-translate-x-full"
              : "hidden"
          }`}
        >
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

        {/* Steam連携パネル */}
        <div
          className={`absolute top-0 left-0 w-1/5 h-full bg-gray-900 overflow-y-auto overflow-x-hidden shadow-lg z-10 transition-transform duration-300 transform ${
            openPanel === "steamList"
              ? "translate-x-0"
              : openPanel === null
              ? "-translate-x-full"
              : "hidden"
          }`}
        >
          <SteamList nodes={nodes} setSelectedIndex={setSelectedIndex} />
        </div>

        {/* ランキングパネル */}
        <div
          className={`absolute top-0 left-0 w-1/5 h-full bg-gray-900 overflow-y-auto overflow-x-hidden shadow-lg z-10 transition-transform duration-300 transform ${
            openPanel === "ranking"
              ? "translate-x-0"
              : openPanel === null
              ? "-translate-x-full"
              : "hidden"
          }`}
        >
          <Leaderboard
            nodes={nodes}
            selectedIndex={selectedIndex}
            setSelectedIndex={setSelectedIndex}
            userAddedGames={userAddedGames}
            setUserAddedGames={setUserAddedGames}
            setIsNetworkLoading={setIsNetworkLoading}
          />
        </div>

        {/* チュートリアル */}
        {/* <Tour run={tourRun} setRun={setTourRun} /> */}
        <Tutorial run={tourRun} setRun={setTourRun} />
      </div>
    </div>
  );
};

export default Network;
