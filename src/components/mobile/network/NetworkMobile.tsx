"use client";
import { useEffect, useState } from "react";
import { DEFAULT_FILTER, DEFAULT_SLIDER } from "@/constants/DEFAULT_FILTER";
import { Filter, SliderSettings } from "@/types/api/FilterType";
import createNetwork from "@/hooks/createNetwork";
import Loading from "@/app/desktop/loading";
import { LinkType, NodeType, StreamerListType } from "@/types/NetworkType";
import { getFilterData, getGameIdData, getSliderData } from "@/hooks/indexedDB";

import SelectParameter from "@/components/network/selectParameter/SelectParameter";
import ChatBar from "@/components/network/chatBar/ChatBar";
import GameList from "@/components/network/gameList/GameList";
import NodeLink from "@/components/network/NodeLink";
import Panel from "@/components/network/Panel";

import StreamedList from "@/components/network/streamedList/StreamedList";

import SearchBar from "./SearchBar";
import IconButton from "@mui/material/IconButton";

import ChatIcon from "@mui/icons-material/Chat";
import LiveTvIcon from "@mui/icons-material/LiveTv";
import ListIcon from '@mui/icons-material/List';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CloseIcon from '@mui/icons-material/Close';
import { useRouter } from "next/navigation";

const buttonClasses = (isActive: boolean) =>
  `w-full py-2 text-center flex flex-col items-center ${
    isActive ? "bg-gray-700" : "hover:bg-gray-700"
  } rounded transition-colors duration-200`;

const NetworkMobile = () => {
  const router = useRouter();

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
        const slider = (await getSliderData()) ?? DEFAULT_SLIDER;
        const gameIds = (await getGameIdData()) ?? [];
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

  useEffect(() => {
    if (selectedIndex !== -1) {
      setIsStreamerOpen(false);
      setIsChatOpen(false);
      setIsSteamListOpen(false);
      if (nodes[selectedIndex]) {
        setCenterX((nodes[selectedIndex].x ?? 0) - 70);
        setCenterY((nodes[selectedIndex].y ?? 0) + 150);
      }
    }
  }, [selectedIndex]);

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
        <div className="w-2/3 bg-transparent overflow-y-auto overflow-x-hidden fixed">
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
            <SelectParameter filter={filter} setFilter={setFilter} setIsLoading={setIsLoading} />
          </div>
        )}


        
        {isChatOpen && (
          <div className="w-2/3 h-1/3 fixed bottom-0 right-0 bg-transparent overflow-hidden z-50">
            <div className="bg-gray-800 rounded-r-lg p-4 shadow-md flex flex-col space-y-2 h-[93vh]">
              <div className="flex items-center space-x-2">
                <ChatIcon className="mr-2 text-white" />
                <h2 className="text-white text-lg font-semibold">チャット</h2>
              </div>
              <div className="border-t border-gray-700 pt-2">
                <ChatBar nodes={nodes} setNodes={setNodes} />
              </div>
              <IconButton onClick={toggleChat} sx={{ color: "white" }}>
                <CloseIcon />
              </IconButton>
            </div>
          </div>
        )}

        {selectedIndex !== -1 && (
          <div className="w-full h-2/6 fixed bottom-0 right-0 bg-transparent overflow-y-auto z-30">
            <Panel title={nodes[selectedIndex].title} icon={<MenuBookIcon className="mr-2 text-white" />}>
            <div className="text-gray-300 overflow-y-auto">
              {nodes[selectedIndex].shortDetails}
              <div className="mt-4 flex space-x-2">
                <button
                  className="bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded"
                  onClick={() =>
                    router.push(
                      `/mobile/details?steam_id=${nodes[selectedIndex].steamGameId}&twitch_id=${nodes[selectedIndex].twitchGameId}`
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
              </div>
            </div>
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
            selectedIndex={selectedIndex}
            isStreamerOpen={isStreamerOpen}
          />
        </div>

        <div className="fixed top-40 right-2 z-10 bg-transparent text-white">
          <button
            onClick={toggleStreamer}
            className={buttonClasses(isStreamerOpen)}
          >
            <LiveTvIcon fontSize="large"/>
          </button>
          <button
            onClick={toggleSteamList}
            className={buttonClasses(isSteamListOpen)}
          >
            <ListIcon fontSize="large"/>
          </button>
        </div>


        <div className="fixed bottom-2 right-2 z-10 bg-transparent">
          <IconButton
            onClick={toggleChat}
            sx={{ color: "white", borderWidth: 2, borderColor: "white", borderStyle: "solid", borderRadius: 9999, flexDirection: "column", bgcolor:"#08082e" }}
          >
            <ChatIcon />
            <div className="text-sm">AIChat</div>
          </IconButton>
        </div>

      </div>
    </div>
  );
};

export default NetworkMobile;
