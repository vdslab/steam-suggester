"use client";
import { useEffect, useState } from "react";
import NodeLink from "./NodeLink";
import SelectParameter from "./selectParameter/SelectParameter";
import GameList from "./gameList/GameList";
import StreamedList from "./streamedList/StreamedList";
import Loading from "@/app/desktop/loading";
import { StreamerListType } from "@/types/NetworkType";
import Sidebar from "./Sidebar";
import LiveTvIcon from "@mui/icons-material/LiveTv";
import Panel from "./Panel";
import SteamList from "./steamList/SteamList";
import HelpTooltip from "./HelpTooltip";
import Tour from "./Tour";
import ProgressBar from "./ProgressBar";
import SimilaritySettings from "./SimilaritySettings/SimilaritySettings";
import TuneIcon from "@mui/icons-material/Tune";
import useTour from "@/hooks/useTour";
import useNetworkGraph from "@/hooks/useNetworkGraph";
import useAllGameData from "@/hooks/useAllGameData";
import { getGameIdData } from "@/hooks/indexedDB";

const Network = () => {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(true);
  const [isNetworkLoading, setIsNetworkLoading] = useState(false);
  const [streamerIds, setStreamerIds] = useState<StreamerListType[]>([]);
  const [openPanel, setOpenPanel] = useState<string | null>(null);
  const { tourRun, setTourRun } = useTour();
  const [progress, setProgress] = useState(0);

  const [gameIds, setGameIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchGameIds = async () => {
      const ids = (await getGameIdData()) ?? [];
      setGameIds(ids);
    };
    fetchGameIds();
  }, [gameIds]);

  const allData = useAllGameData(gameIds);

  const {
    nodes,
    links,
    centerX,
    centerY,
    filter,
    setFilter,
    slider,
    setSlider,
    setCenterX,
    setCenterY,
  } = useNetworkGraph(
    allData,
    isLoading,
    isNetworkLoading,
    setIsLoading,
    setIsNetworkLoading,
    setProgress
  );

  // Sidebar のトグル関数
  const togglePanel = (panelName: string) => {
    setOpenPanel((prevPanel) => (prevPanel === panelName ? null : panelName));
    setTourRun(false);
  };

  const toggleTourRun = () => {
    setTourRun((prev) => {
      const newState = !prev;
      if (newState) {
        setOpenPanel(null);
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
        openPanel={openPanel}
        togglePanel={togglePanel}
        tourRun={tourRun}
        toggleTourRun={toggleTourRun}
      />

      {/* メインコンテンツエリア */}
      <div className="test1 flex-1 relative bg-gray-900 overflow-hidden">
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
              isStreamerOpen={openPanel === "streamer"}
            />
          </div>
        ) : (
          <ProgressBar progress={progress} />
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

        {/* StreamerListパネル */}
        {openPanel === "streamer" && (
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
        {openPanel === "chat" && (
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
            setGameIds={setGameIds}
          />
        </div>

        <Tour run={tourRun} setRun={setTourRun} />
      </div>
    </div>
  );
};

export default Network;
