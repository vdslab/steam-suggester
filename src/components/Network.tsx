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
  CenterType,
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
import changeNetwork from "@/hooks/changeNetwork";
import useScreenSize from "@visx/responsive/lib/hooks/useScreenSize";
import { startsWithPanelList } from "./common/Utils";

const Network = () => {
  const { data: steamAllData, error: steamAllDataError } = useSWR<
    SteamDetailsDataType[]
  >(
    `${process.env.NEXT_PUBLIC_CURRENT_URL}/api/network/getMatchGames`,
    fetcher
  );
  const { data: steamListData, error: steamListDataError } = useSWR<
    SteamListType[]
  >(`${process.env.NEXT_PUBLIC_CURRENT_URL}/api/network/getSteamList`, fetcher);

  const { width, height } = useScreenSize({ debounceTime: 150 });

  const [filter, setFilter] = useState<Filter>(DEFAULT_FILTER);
  const [slider, setSlider] = useState<SliderSettings>(DEFAULT_SLIDER);

  const [nodes, setNodes] = useState<NodeType[]>([]);
  const [links, setLinks] = useState<LinkType[]>([]);
  const [center, setCenter] = useState<CenterType>({ x: 0, y: 0, k: 1 });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [isNetworkLoading, setIsNetworkLoading] = useState(true);

  const [streamerIds, setStreamerIds] = useState<StreamerListType[]>([]);

  // openPanel を他のパネルのみに使用
  const [openPanel, setOpenPanel] = useState<string | null>(null);

  const { tourRun, setTourRun } = useTour();

  const [prevAddedGameId, setPrevAddedGameId] = useState<string>("");

  const initialNodes = async (
    filter: Filter,
    gameIds: string[],
    slider: SliderSettings
  ) => {
    if (!steamAllData) return;

    if (nodes.length === 0) {
      // 新規作成
      const { nodes, links } = await createNetwork(
        steamAllData,
        filter,
        gameIds,
        slider
      );
      const buffNodes = [...nodes].sort(
        (node1, node2) => (node2.circleScale ?? 0) - (node1.circleScale ?? 0)
      );
      setCenter({
        x: (buffNodes[0]?.x ?? 0) - width / 10,
        y: (buffNodes[0]?.y ?? 0) + (width >= 768 ? height / 10 : height / 4),
        k: buffNodes[0]?.circleScale ?? 1,
      });

      setSelectedIndex(-1);

      setNodes(nodes);
      setLinks(links);
    } else {
      // 既存ネットワークをアップデート
      const result = await changeNetwork(
        steamAllData,
        filter,
        gameIds,
        slider,
        nodes
      );
      const rawNodes = result?.nodes ?? [];
      const rawLinks = result?.links ?? [];
      const buffNodes = [...rawNodes].sort(
        (node1, node2) => (node2.circleScale ?? 0) - (node1.circleScale ?? 0)
      );
      const index = buffNodes.findIndex(
        (node: NodeType) => node.steamGameId === prevAddedGameId
      );
      if (buffNodes.length > 0 && index === -1) {
        setSelectedIndex(-1);
      } else if (index !== -1) {
        setSelectedIndex(index);
      }
      setPrevAddedGameId("");
      setNodes(rawNodes);
      setLinks(rawLinks);
    }
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
      setCenter({
        x: (nodes[selectedIndex].x ?? 0) - width / 10,
        y:
          (nodes[selectedIndex].y ?? 0) +
          (width >= 768 ? height / 10 : height / 4),
        k: nodes[selectedIndex].circleScale ?? 1,
      });
    }
  }, [selectedIndex, nodes]);

  const togglePanel = (panelName: string) => {
    if (openPanel === panelName) {
      setOpenPanel(`${panelName}-close`);
      setTourRun(false);
    } else {
      setOpenPanel((prevPanel) => {
        const newPanel = prevPanel === panelName ? null : panelName;
        return newPanel;
      });
      setTourRun(false);
    }
  };

  const toggleTourRun = () => {
    setTourRun((prev) => {
      const newState = !prev;
      if (newState) {
        setOpenPanel(null);
        setSelectedIndex(-1);
      }
      return newState;
    });
  };

  // データ取得失敗
  if (!steamAllData || !steamListData) {
    return <Loading />;
  }
  if (steamAllDataError || steamListDataError) {
    return (
      <Error
        error={steamAllDataError || steamListDataError}
        reset={() => setIsNetworkLoading(true)}
      />
    );
  }

  // パネルの共通クラス
  const panelClassNames = (openPanelName: string) =>
    `absolute top-0 left-0 h-full bg-gray-900 overflow-y-auto overflow-x-hidden shadow-lg z-10 transition-transform duration-300 transform ${
      openPanel === openPanelName
        ? "translate-x-0"
        : openPanel === null || openPanel === `${openPanelName}-close`
        ? "-translate-x-full"
        : "hidden"
    }
    w-2/3 lg:w-1/5`;

  return (
    <div className="flex flex-1 overflow-hidden text-white relative">
      {/* サイドバー */}
      <Sidebar
        openPanel={openPanel}
        togglePanel={togglePanel}
        tourRun={tourRun}
        toggleTourRun={toggleTourRun}
      />

      {/* メインコンテンツ */}
      <div className="flex-1 relative overflow-hidden z-10">
        <HomeHeader />

        <SearchGames
          setSelectedIndex={setSelectedIndex}
          nodes={nodes}
          setIsNetworkLoading={setIsNetworkLoading}
          steamListData={steamListData}
          openPanel={openPanel}
          setPrevAddedGameId={setPrevAddedGameId}
        />

        {/* ゲーム詳細表示 */}
        {selectedIndex !== -1 &&
          nodes[selectedIndex] &&
          !startsWithPanelList(openPanel) && (
            <div className="absolute right-0 z-20 overflow-y-scroll h-1/3 bottom-0 md:w-1/4 md:h-auto md:bottom-auto md:top-0 lg:h-full">
              <GameDetail
                node={nodes[selectedIndex]}
                setSelectedIndex={setSelectedIndex}
                setOpenPanel={setOpenPanel}
                selectedTags={selectedTags}
                setSelectedTags={setSelectedTags}
              />
            </div>
          )}

        {/* ネットワークグラフ */}
        <div className="absolute inset-0">
          <NodeLink
            nodes={nodes}
            links={links}
            center={center}
            selectedIndex={selectedIndex}
            setSelectedIndex={setSelectedIndex}
            streamerIds={streamerIds}
            openPanel={openPanel}
            selectedTags={selectedTags}
          />
        </div>

        {/* ▼ ローディング時に表示する: 背景を暗くしてスピナーを中央に */}
        {isNetworkLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-dashed border-white rounded-full animate-spin" />
          </div>
        )}

        {/* フィルターパネル */}
        <div className={`${panelClassNames("filter")}`}>
          <SelectParameter
            filter={filter}
            setFilter={setFilter}
            setIsNetworkLoading={setIsNetworkLoading}
          />
        </div>

        {/* 強調表示パネル */}
        <div className={`${panelClassNames("highlight")}`}>
          <HighlightPanel
            selectedTags={selectedTags}
            setSelectedTags={setSelectedTags}
          />
        </div>

        {/* StreamerList パネル */}
        <div className={`${panelClassNames("streamer")}`}>
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
        <div className={`${panelClassNames("similarity")}`}>
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
        <div className={`${panelClassNames("steamList")}`}>
          <SteamList
            nodes={nodes}
            setSelectedIndex={setSelectedIndex}
            setIsNetworkLoading={setIsNetworkLoading}
          />
        </div>

        {/* ランキングパネル */}
        <div className={`${panelClassNames("ranking")}`}>
          <Leaderboard
            nodes={nodes}
            selectedIndex={selectedIndex}
            setSelectedIndex={setSelectedIndex}
            setIsNetworkLoading={setIsNetworkLoading}
          />
        </div>

        {/* チュートリアル */}
        <Tutorial run={tourRun} setRun={setTourRun} />
      </div>
    </div>
  );
};

export default Network;
