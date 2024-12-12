"use client";
import { useEffect, useState, useRef } from "react";
import NodeLink from "./NodeLink";
import SelectParameter from "./selectParameter/SelectParameter";
import { DEFAULT_FILTER, DEFAULT_SLIDER } from "@/constants/DEFAULT_FILTER";
import { Filter, SliderSettings } from "@/types/api/FilterType";
import GameList from "./gameList/GameList";
import StreamedList from "./streamedList/StreamedList";
import createNetwork from "@/hooks/createNetwork";
import Loading from "@/app/desktop/loading";
import { LinkType, NodeType, StreamerListType } from "@/types/NetworkType";
import { getFilterData, getGameIdData, getSliderData } from "@/hooks/indexedDB";
import Sidebar from "./Sidebar";
import LiveTvIcon from "@mui/icons-material/LiveTv";
import Panel from "./Panel";
import SteamList from "./steamList/SteamList";
import HelpTooltip from "./HelpTooltip";
import Tour from "./Tour";
import ProgressBar from "./ProgressBar";
import SimilaritySettings from "./SimilaritySettings/SimilaritySettings";
import TuneIcon from "@mui/icons-material/Tune";

const Network = () => {
  const [filter, setFilter] = useState<Filter>(DEFAULT_FILTER);
  const [slider, setSlider] = useState<SliderSettings>(DEFAULT_SLIDER);

  const [nodes, setNodes] = useState<NodeType[]>([]);
  const [links, setLinks] = useState<LinkType[]>([]);
  const [centerX, setCenterX] = useState<number>(0);
  const [centerY, setCenterY] = useState<number>(0);

  const [selectedIndex, setSelectedIndex] = useState(-1);

  const [isLoading, setIsLoading] = useState(true);
  const [isNetworkLoading, setIsNetworkLoading] = useState(false);

  const [streamerIds, setStreamerIds] = useState<StreamerListType[]>([]);

  // 各機能の開閉状態を管理
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [isStreamerOpen, setIsStreamerOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isSteamListOpen, setIsSteamListOpen] = useState<boolean>(false);
  const [tourRun, setTourRun] = useState<boolean>(true);

  const [progress, setProgress] = useState(0);

  // Refを使用して副作用の実行を制御
  const hasFetchedInitialData = useRef(false);

  const initialNodes = async (filter: Filter, gameIds: string[], slider: SliderSettings) => {
    setProgress(0);
    const result = await createNetwork(filter, gameIds, slider, setProgress);
    const nodes = result?.nodes ?? [];
    const links = result?.links ?? [];
    const buffNodes = nodes.concat();
    buffNodes.sort(
      (node1: NodeType, node2: NodeType) =>
        (node2.circleScale ?? 0) - (node1.circleScale ?? 0)
    );
    if (centerX === 0 && centerY === 0 && buffNodes.length > 0) {
      setCenterX((buffNodes[0]?.x ?? 0) - 150);
      setCenterY((buffNodes[0]?.y ?? 0) + 100);
    }
    setNodes(nodes);
    setLinks(links);
    setProgress(100);
  };

  useEffect(() => {
    // `isLoading` または `isNetworkLoading` が true で、まだデータをフェッチしていない場合
    if ((isLoading || isNetworkLoading) && !hasFetchedInitialData.current) {
      hasFetchedInitialData.current = true; // フラグを立てる
      (async () => {
        const filterData = (await getFilterData()) ?? DEFAULT_FILTER;
        const gameIds = (await getGameIdData()) ?? [];
        const sliderData = (await getSliderData()) ?? DEFAULT_SLIDER;
        setFilter(filterData);
        setSlider(sliderData);
        await initialNodes(filterData, gameIds, sliderData);
        setIsLoading(false);
        setIsNetworkLoading(false);
      })();
    }
  }, [isLoading, isNetworkLoading]);

  // Sidebar のトグル関数
  const toggleFilter = () => {
    setIsFilterOpen((prev) => {
      const newState = !prev;
      if (newState) {
        setIsStreamerOpen(false);
        setIsChatOpen(false);
        setIsSteamListOpen(false);
        setTourRun(false);
      }
      return newState;
    });
  };

  const toggleStreamer = () => {
    setIsStreamerOpen((prev) => {
      const newState = !prev;
      if (newState) {
        setIsFilterOpen(false);
        setIsChatOpen(false);
        setIsSteamListOpen(false);
        setTourRun(false);
      }
      return newState;
    });
  };

  const toggleChat = () => {
    setIsChatOpen((prev) => {
      const newState = !prev;
      if (newState) {
        setIsFilterOpen(false);
        setIsStreamerOpen(false);
        setIsSteamListOpen(false);
        setTourRun(false);
      }
      return newState;
    });
  };

  const toggleSteamList = () => {
    setIsSteamListOpen((prev) => {
      const newState = !prev;
      if (newState) {
        setIsFilterOpen(false);
        setIsStreamerOpen(false);
        setIsChatOpen(false);
        setTourRun(false);
      }
      return newState;
    });
  };

  const toggleTourRun = () => {
    setTourRun((prev) => {
      const newState = !prev;
      if (newState) {
        setIsFilterOpen(false);
        setIsStreamerOpen(false);
        setIsChatOpen(false);
        setIsSteamListOpen(false);
      }
      return newState;
    });
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="flex h-[92vh] overflow-hidden text-white">
      {/* Sidebar を追加 */}
      <Sidebar
        isFilterOpen={isFilterOpen}
        toggleFilter={toggleFilter}
        isStreamerOpen={isStreamerOpen}
        toggleStreamer={toggleStreamer}
        isChatOpen={isChatOpen}
        toggleChat={toggleChat}
        isSteamListOpen={isSteamListOpen}
        toggleSteamList={toggleSteamList}
        tourRun={tourRun}
        toggleTourRun={toggleTourRun}
      />

      {/* メインコンテンツエリアを relative に設定 */}
      <div className="test1 flex-1 relative bg-gray-900 overflow-hidden">
        {!isNetworkLoading ? (
          <div className="absolute inset-0">
            {/* メインコンテンツ */}
            <NodeLink
              nodes={nodes}
              links={links}
              centerX={centerX}
              centerY={centerY}
              selectedIndex={selectedIndex}
              setSelectedIndex={setSelectedIndex}
              streamerIds={streamerIds}
              isStreamerOpen={isStreamerOpen}
            />
          </div>
        ) : (
          <ProgressBar progress={progress} />
        )}

        {/* フィルターパネル */}
        {isFilterOpen && (
          <div className="absolute top-0 left-0 w-1/5 h-full bg-gray-900 overflow-y-auto overflow-x-hidden shadow-lg z-10 transition-transform duration-300">
            <SelectParameter
              filter={filter}
              setFilter={setFilter}
              setIsNetworkLoading={setIsNetworkLoading}
            />
          </div>
        )}

        {/* StreamerListパネル */}
        {isStreamerOpen && (
          <div className="absolute top-0 left-0 w-1/5 h-full bg-transparent overflow-y-auto overflow-x-hidden shadow-lg z-10 transition-transform duration-300">
            <Panel
              title={
                <div className="flex items-center">
                  <span>配信者</span>
                  <HelpTooltip title="配信者を追加すると配信者が配信したゲームのアイコンに枠が表示されます。" />
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

        {/* ChatBarパネル */}
        {isChatOpen && (
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
        {isSteamListOpen && (
          <div className="absolute top-0 left-0 w-1/5 h-full bg-gray-900 overflow-y-auto overflow-x-hidden shadow-lg z-10 transition-transform duration-300">
            <SteamList />
          </div>
        )}

        {/* ゲームリストパネル */}
        <div className="absolute top-0 right-0 w-1/5 h-full bg-transparent overflow-y-auto overflow-x-hidden shadow-lg z-10 transition-transform duration-300">
          <GameList
            nodes={nodes}
            selectedIndex={selectedIndex}
            setSelectedIndex={setSelectedIndex}
            setCenterX={setCenterX}
            setCenterY={setCenterY}
            setIsNetworkLoading={setIsNetworkLoading}
          />
        </div>

        <Tour run={tourRun} setRun={setTourRun} />
      </div>
    </div>
  );
};

export default Network;
