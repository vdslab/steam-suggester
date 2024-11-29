/* Network.tsx */
"use client";
import { useEffect, useState } from "react";
import NodeLink from "./NodeLink";
import SelectParameter from "./selectParameter/SelectParameter";
import { DEFAULT_FILTER } from "@/constants/DEFAULT_FILTER";
import { Filter } from "@/types/api/FilterType";
import GameList from "./gameList/GameList";
import StreamedList from "./streamedList/StreamedList";
import createNetwork from "@/hooks/createNetwork";
import Loading from "@/app/desktop/loading";
import { LinkType, NodeType, StreamerListType } from "@/types/NetworkType";
import { getFilterData, getGameIdData } from "@/hooks/indexedDB";
import Sidebar from "./Sidebar";
import EmphasisIcon from "@mui/icons-material/Highlight";
import ChatIcon from "@mui/icons-material/Chat";
import LiveTvIcon from "@mui/icons-material/LiveTv";
import Panel from "./Panel";
import Section from "./Section";
import ChatBar from "./chatBar/ChatBar"; // ChatBar コンポーネントのインポート
import SteamList from "./steamList/SteamList";

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
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(true);
  const [isGameListOpen, setIsGameListOpen] = useState<boolean>(true);
  const [isEmphasisOpen, setIsEmphasisOpen] = useState<boolean>(false);
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
  const toggleFilter = () => setIsFilterOpen((prev) => !prev);
  const toggleGameList = () => setIsGameListOpen((prev) => !prev);
  const toggleEmphasis = () => setIsEmphasisOpen((prev) => !prev);
  const toggleSteamList = () => setIsSteamListOpen((prev) => !prev);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="flex h-[92vh] overflow-hidden">
      {/* Sidebar を追加 */}
      <Sidebar
        isFilterOpen={isFilterOpen}
        toggleFilter={toggleFilter}
        isGameListOpen={isGameListOpen}
        toggleGameList={toggleGameList}
        isEmphasisOpen={isEmphasisOpen}
        toggleEmphasis={toggleEmphasis}
        isSteamListOpen={isSteamListOpen}
        toggleSteamList={toggleSteamList}
      />

      {/* フィルターパネル */}
      {isFilterOpen && (
        <div className="w-1/5 bg-gray-900 overflow-y-auto overflow-x-hidden">
          <SelectParameter filter={filter} setFilter={setFilter} />
        </div>
      )}

      {/* 強調パネル */}
      {isEmphasisOpen && (
        <div className="w-1/5 bg-transparent overflow-y-auto overflow-x-hidden">
          <Panel title="強調" icon={<EmphasisIcon className="mr-2 text-white" />}>
            {/* ChatBar セクション */}
            <Section title="チャット" icon={<ChatIcon />}>
              <ChatBar nodes={nodes} setNodes={setNodes} />
            </Section>

            {/* StreamedList セクション */}
            <Section title="配信者" icon={<LiveTvIcon />} hasDivider={false}>
              <StreamedList
                nodes={nodes}
                streamerIds={streamerIds}
                setStreamerIds={setStreamerIds}
              />
            </Section>
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

      {/* ゲームリストパネル */}
      {isGameListOpen && (
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
      )}
    </div>
  );
};

export default Network;
