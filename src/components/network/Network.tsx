/* Network.tsx */
"use client";
import { useEffect, useState } from "react";
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
import ChatIcon from "@mui/icons-material/Chat";
import LiveTvIcon from "@mui/icons-material/LiveTv";
import Panel from "./Panel";
import ChatBar from "./chatBar/ChatBar";
import SteamList from "./steamList/SteamList";
import SimilaritySettings from "./SimilaritySettings/SimilaritySettings";

import Joyride from 'react-joyride';
import Tour from "./Tour";



const Network = () => {
  const [filter, setFilter] = useState<Filter>(DEFAULT_FILTER);

  const [nodes, setNodes] = useState<NodeType[]>([]);
  const [links, setLinks] = useState<LinkType[]>([]);
  const [centerX, setCenterX] = useState<number>(0);
  const [centerY, setCenterY] = useState<number>(0);

  const [selectedIndex, setSelectedIndex] = useState(-1);

  const [isLoading, setIsLoading] = useState(true);

  const [streamerIds, setStreamerIds] = useState<StreamerListType[]>([]);

  // 各機能の開閉状態を管理
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [isStreamerOpen, setIsStreamerOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isSteamListOpen, setIsSteamListOpen] = useState<boolean>(false);
  const [tourRun, setTourRun] = useState<boolean>(true);

  const initialNodes = async (filter: Filter, gameIds: string[], slider: SliderSettings) => {
    const result = await createNetwork(filter, gameIds, slider);
    const nodes = result?.nodes ?? [];
    const links = result?.links ?? [];
    const buffNodes = nodes.concat();
    buffNodes.sort(
      (node1: NodeType, node2: NodeType) =>
        (node2.circleScale ?? 0) - (node1.circleScale ?? 0)
    );
    if (centerX === 0 && centerY === 0 && buffNodes.length > 0) {
      setCenterX(buffNodes[0]?.x ?? 0);
      setCenterY(buffNodes[0]?.y ?? 0);
    }
    setNodes(nodes);
    setLinks(links);
  };

  useEffect(() => {
    if (isLoading) {
      (async () => {
        const filter = (await getFilterData()) ?? DEFAULT_FILTER;
        const gameIds = (await getGameIdData()) ?? [];
        const slider = (await getSliderData()) ?? DEFAULT_SLIDER;
        setFilter(filter);
        await initialNodes(filter, gameIds, slider);
        setIsLoading(false);
      })();
    }
  }, [isLoading]);

  useEffect(() => {
    if (!isLoading) {
      (async () => {
        const gameIds = (await getGameIdData()) ?? [];
        const slider = (await getSliderData()) ?? DEFAULT_SLIDER;
        initialNodes(filter, gameIds, slider);
      })();
    }
  }, [filter]);

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
    <div className="flex h-[92vh] overflow-hidden">
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

      {/* フィルターパネル */}
      {isFilterOpen && (
        <div className="w-1/5 bg-gray-900 overflow-y-auto overflow-x-hidden">
          <SelectParameter filter={filter} setFilter={setFilter} />
        </div>
      )}

      {/* StreamerListパネル */}
      {isStreamerOpen && (
        <div className="w-1/5 bg-transparent overflow-y-auto overflow-x-hidden">
          <Panel title="配信者" icon={<LiveTvIcon className="mr-2 text-white" />}>
            <StreamedList
              nodes={nodes}
              streamerIds={streamerIds}
              setStreamerIds={setStreamerIds}
            />
          </Panel>
        </div>
      )}

      {/* ChatBarパネル*/}
      {isChatOpen && (
        <div className="w-1/5 bg-transparent overflow-y-auto overflow-x-hidden">
          <Panel title="チャット" icon={<ChatIcon className="mr-2 text-white" />}>
            {/* <ChatBar nodes={nodes} setNodes={setNodes} /> */}
            <SimilaritySettings />
          </Panel>
        </div>
      )}

      {/* Steam連携パネル */}
      {isSteamListOpen && (
        <div className="w-1/5 bg-gray-900 overflow-y-auto overflow-x-hidden">
          <SteamList />
        </div>
      )}

      {/* メインコンテンツエリア */}
      <div className="flex-1 bg-gray-900 flex flex-col overflow-y-hidden overflow-x-hidden step0">
        <NodeLink
          nodes={nodes}
          links={links}
          centerX={centerX}
          centerY={centerY}
          setSelectedIndex={setSelectedIndex}
          streamerIds={streamerIds}
        />
      </div>

      {/* ゲームリストパネル */}
      <div className="w-1/5 bg-gray-900 overflow-y-auto overflow-x-hidden">
        <GameList
          nodes={nodes}
          selectedIndex={selectedIndex}
          setSelectedIndex={setSelectedIndex}
          setCenterX={setCenterX}
          setCenterY={setCenterY}
          setIsLoading={setIsLoading}
        />
      </div>

      <Tour run={tourRun} setRun={setTourRun}/>

    </div>
  );
};

export default Network;
