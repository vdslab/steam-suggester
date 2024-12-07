"use client";
import { useEffect, useState } from "react";
import { DEFAULT_FILTER } from "@/constants/DEFAULT_FILTER";
import { Filter } from "@/types/api/FilterType";
import createNetwork from "@/hooks/createNetwork";
import Loading from "@/app/desktop/loading";
import { LinkType, NodeType, StreamerListType } from "@/types/NetworkType";
import { getFilterData, getGameIdData } from "@/hooks/indexedDB";

import SelectParameter from "@/components/network/selectParameter/SelectParameter";
import ChatBar from "@/components/network/chatBar/ChatBar";
import GameList from "@/components/network/gameList/GameList";
import NodeLink from "@/components/network/NodeLink";
import Panel from "@/components/network/Panel";
import Sidebar from "@/components/network/Sidebar";
import SteamList from "@/components/network/steamList/SteamList";
import StreamedList from "@/components/network/streamedList/StreamedList";

import FilterListIcon from '@mui/icons-material/FilterList';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import ChatIcon from "@mui/icons-material/Chat";
import LiveTvIcon from "@mui/icons-material/LiveTv";

import ListIcon from '@mui/icons-material/List';
import SearchBar from "./SearchBar";

const buttonClasses = (isActive: boolean) =>
  `w-full py-2 text-center flex flex-col items-center ${
    isActive ? "bg-gray-700" : "hover:bg-gray-700"
  } rounded transition-colors duration-200`;

const NetworkMobile = () => {
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

  const initialNodes = async (filter: Filter, gameIds: string[]) => {
    const result = await createNetwork(filter, gameIds);
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
        setFilter(filter);
        await initialNodes(filter, gameIds);
        setIsLoading(false);
      })();
    }
  }, [isLoading]);

  useEffect(() => {
    if (!isLoading) {
      (async () => {
        const gameIds = (await getGameIdData()) ?? [];
        initialNodes(filter, gameIds);
      })();
    }
  }, [filter]);

  // Sidebar のトグル関数
  const toggleStreamer = () => {
    setIsStreamerOpen((prev) => {
      const newState = !prev;
      if (newState) {
        setIsChatOpen(false);
        setIsSteamListOpen(false);
      }
      return newState;
    });
  };

  const toggleChat = () => {
    setIsChatOpen((prev) => {
      const newState = !prev;
      if (newState) {
        setIsStreamerOpen(false);
        setIsSteamListOpen(false);
      }
      return newState;
    });
  };

  const toggleSteamList = () => {
    setIsSteamListOpen((prev) => {
      const newState = !prev;
      if (newState) {
        setIsStreamerOpen(false);
        setIsChatOpen(false);
      }
      return newState;
    });
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div>
      {isStreamerOpen && (
        <div className="w-2/3 h-[93vh] bg-transparent overflow-y-auto overflow-x-hidden fixed">
          <Panel title="配信者" icon={<LiveTvIcon className="mr-2 text-white" />}>
            <StreamedList
              nodes={nodes}
              streamerIds={streamerIds}
              setStreamerIds={setStreamerIds}
            />
          </Panel>
        </div>
      )}

      {isSteamListOpen && (
        <div className="w-2/3 bg-transparent overflow-y-auto overflow-x-hidden fixed max-h-[93vh]">
          <GameList
            nodes={nodes}
            selectedIndex={selectedIndex}
            setSelectedIndex={setSelectedIndex}
            setCenterX={setCenterX}
            setCenterY={setCenterY}
            setIsLoading={setIsLoading}
          />
        </div>
      )}

      <SearchBar
        nodes={nodes}
        isFilterOpen={isFilterOpen}
        setIsFilterOpen={setIsFilterOpen}
        setCenterX={setCenterX}
        setCenterY={setCenterY}
        setSelectedIndex={setSelectedIndex}
      />

      <div className="flex h-[88vh] overflow-hidden">

        {isFilterOpen && (
          <div className="bg-gray-900 overflow-y-auto overflow-x-hidden z-50">
            <SelectParameter filter={filter} setFilter={setFilter} />
          </div>
        )}


        
        {isChatOpen && (
          <div className="w-2/3 bg-transparent overflow-y-auto overflow-x-hidden">
            <Panel title="チャット" icon={<ChatIcon className="mr-2 text-white" />}>
              <ChatBar nodes={nodes} setNodes={setNodes} />
            </Panel>
          </div>
        )}

        <div className="flex-1 bg-gray-900 flex flex-col overflow-y-hidden overflow-x-hidden">
          <NodeLink
            nodes={nodes}
            links={links}
            centerX={centerX}
            centerY={centerY}
            setSelectedIndex={setSelectedIndex}
            streamerIds={streamerIds}
          />
        </div>

        <div className="fixed top-40 right-2 z-10 bg-transparent text-white">
          <button
            onClick={toggleStreamer}
            className={buttonClasses(isStreamerOpen)}
          >
            <LiveTvIcon />
          </button>
          <button
            onClick={toggleSteamList}
            className={buttonClasses(isSteamListOpen)}
          >
            <ListIcon />
          </button>
        </div>


        <div className="fixed bottom-2 right-2 z-10 bg-transparent text-white">
          <button
            onClick={toggleChat}
            className={buttonClasses(isChatOpen)}
          >
            <ChatIcon />
          </button>
        </div>


        {/* ゲームリストパネル */}
        {/* <div className="w-1/5 bg-gray-900 overflow-y-auto overflow-x-hidden">
          <GameList
            nodes={nodes}
            selectedIndex={selectedIndex}
            setSelectedIndex={setSelectedIndex}
            setCenterX={setCenterX}
            setCenterY={setCenterY}
            setIsLoading={setIsLoading}
          />
        </div> */}
      </div>
    </div>
  );
};

export default NetworkMobile;
