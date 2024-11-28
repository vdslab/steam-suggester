/* Network.tsx */
"use client"; 
import { useEffect, useState } from 'react';
import NodeLink from "./NodeLink";
import SelectParameter from './selectParameter/SelectParameter';
import { DEFAULT_FILTER } from '@/constants/DEFAULT_FILTER';
import { Filter } from '@/types/api/FilterType';
import GameList from './gameList/GameList';
import createNetwork from '@/hooks/createNetwork';
import Loading from '@/app/desktop/loading';
import { LinkType, NodeType } from '@/types/NetworkType';
import { getFilterData, getGameIdData } from '@/hooks/indexedDB';
import ChatBar from './chatBar/ChatBar';
import Popup from './Popup';
import Sidebar from './Sidebar'; // 追加

const Network = () => {
  const [filter, setFilter] = useState<Filter>(DEFAULT_FILTER);

  const [nodes, setNodes] = useState<NodeType[]>([]);
  const [links, setLinks] = useState<LinkType[]>([]);
  const [centerX, setCenterX] = useState<number>(0);
  const [centerY, setCenterY] = useState<number>(0);

  const [selectedIndex, setSelectedIndex] = useState(-1);

  const [isLoading, setIsLoading] = useState(true);

  // サイドバーで制御する各機能の表示状態
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isGameListOpen, setIsGameListOpen] = useState(true);

  const initialNodes = async (filter: Filter, gameIds: string[]) => {
    const result = await createNetwork(filter, gameIds);
    const nodes = result?.nodes ?? [];
    const links = result?.links ?? [];
    const buffNodes = nodes.concat();
    buffNodes.sort((node1: NodeType, node2: NodeType) => (node2.circleScale ?? 0) - (node1.circleScale ?? 0));
    if(centerX === 0 && centerY === 0) {
      setCenterX(buffNodes[0]?.x ?? 0);
      setCenterY(buffNodes[0]?.y ?? 0);
    }
    setNodes(nodes);
    setLinks(links);
  };

  useEffect(() => {
    if(isLoading) {
      (async () => {
        const filter = await getFilterData() ?? DEFAULT_FILTER;
        const gameIds = await getGameIdData() ?? [];
        setFilter(filter);
        await initialNodes(filter, gameIds);
        setIsLoading(false);
      })();
    }
  }, [isLoading]);

  useEffect(() => {
    if(!isLoading) {
      (async () => {
        const gameIds = await getGameIdData() ?? [];
        initialNodes(filter, gameIds);
      })();
    }
  }, [filter]);

  // トグル関数
  const toggleFilter = () => setIsFilterOpen(prev => !prev);
  const toggleChat = () => setIsChatOpen(prev => !prev);
  const toggleGameList = () => setIsGameListOpen(prev => !prev);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar
        isFilterOpen={isFilterOpen}
        toggleFilter={toggleFilter}
        isChatOpen={isChatOpen}
        toggleChat={toggleChat}
        isGameListOpen={isGameListOpen}
        toggleGameList={toggleGameList}
      />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Filter Panel */}
        {isFilterOpen && (
          <div className="w-1/5 bg-stone-950 overflow-y-auto overflow-x-hidden">
            <SelectParameter filter={filter} setFilter={setFilter} />
          </div>
        )}

        {/* Center Panel */}
        <div className={`${isFilterOpen ? 'w-4/5' : 'w-full'} bg-gray-900 flex flex-col overflow-y-hidden overflow-x-hidden`}>
          {/* ChatBar */}
          {isChatOpen && <ChatBar nodes={nodes} setNodes={setNodes} />}
          {/* NodeLink */}
          <NodeLink nodes={nodes} links={links} centerX={centerX} centerY={centerY} setSelectedIndex={setSelectedIndex} />
        </div>

        {/* Game List / Popup Panel */}
        <div className="w-1/5 bg-stone-950 overflow-y-auto overflow-x-hidden">
          {isGameListOpen && (
            selectedIndex !== -1 ? 
              <Popup nodes={nodes} selectedIndex={selectedIndex} setSelectedIndex={setSelectedIndex} /> 
              : 
              <GameList nodes={nodes} setCenterX={setCenterX} setCenterY={setCenterY} setIsLoading={setIsLoading} />
          )}
        </div>
      </div>

      {/* Loading Indicator */}
      {isLoading && <Loading />}
    </div>
  );
}

export default Network;
