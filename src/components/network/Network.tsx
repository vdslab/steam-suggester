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

import { FaFilter, FaGamepad, FaComments } from 'react-icons/fa'; // Importing icons

const Network = () => {
  const [filter, setFilter] = useState<Filter>(DEFAULT_FILTER);

  const [nodes, setNodes] = useState<NodeType[]>([]);
  const [links, setLinks] = useState<LinkType[]>([]);
  const [centerX, setCenterX] = useState<number>(0);
  const [centerY, setCenterY] = useState<number>(0);

  const [selectedIndex, setSelectedIndex] = useState(-1);

  const [isLoading, setIsLoading] = useState(true);

  // New state variables for panel visibility
  const [activePanel, setActivePanel] = useState<'filter' | 'chat' | 'gamelist' | null>('filter');

  const initialNodes = async (filter: Filter, gameIds: string[]) => {
    const result = await createNetwork(filter, gameIds);
    const nodes = result?.nodes ?? [];
    const links = result?.links ?? [];
    const buffNodes = nodes.concat();
    buffNodes.sort((node1: NodeType, node2: NodeType) => (node2.circleScale ?? 0) - (node1.circleScale ?? 0));
    if (centerX === 0 && centerY === 0) {
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

  // Function to handle node selection and open the right panel automatically
  const handleSetSelectedIndex = (index: number) => {
    setSelectedIndex(index);
    if (index !== -1) {
      setActivePanel('gamelist');
    }
  };

  return (
    <div className="flex h-screen">
      {/* Navigation Sidebar */}
      <div className="w-16 bg-stone-950 flex flex-col items-center py-4">
        <button
          className={`mb-4 ${activePanel === 'filter' ? 'text-blue-500' : 'text-white'}`}
          onClick={() => setActivePanel(activePanel === 'filter' ? null : 'filter')}
          title="フィルター"
        >
          <FaFilter size={24} />
        </button>
        <button
          className={`mb-4 ${activePanel === 'chat' ? 'text-blue-500' : 'text-white'}`}
          onClick={() => setActivePanel(activePanel === 'chat' ? null : 'chat')}
          title="チャット"
        >
          <FaComments size={24} />
        </button>
        <button
          className={`${activePanel === 'gamelist' ? 'text-blue-500' : 'text-white'}`}
          onClick={() => setActivePanel(activePanel === 'gamelist' ? null : 'gamelist')}
          title="ゲームリスト"
        >
          <FaGamepad size={24} />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Panel */}
        {activePanel === 'filter' && (
          <div className="w-64 bg-stone-950 overflow-y-auto">
            <SelectParameter filter={filter} setFilter={setFilter} />
          </div>
        )}

        {/* Center Panel */}
        <div className="flex-1 bg-gray-900 relative">
          {/* Overlay ChatBar when active */}
          {activePanel === 'chat' && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 w-2/3">
              <ChatBar nodes={nodes} setNodes={setNodes} />
            </div>
          )}

          <NodeLink
            nodes={nodes}
            links={links}
            centerX={centerX}
            centerY={centerY}
            setSelectedIndex={handleSetSelectedIndex}
          />
        </div>

        {/* Right Panel */}
        {activePanel === 'gamelist' && (
          <div className="w-64 bg-stone-950 overflow-y-auto">
            {selectedIndex !== -1 ? (
              <Popup
                nodes={nodes}
                selectedIndex={selectedIndex}
                setSelectedIndex={setSelectedIndex}
              />
            ) : (
              <GameList
                nodes={nodes}
                setCenterX={setCenterX}
                setCenterY={setCenterY}
                setIsLoading={setIsLoading}
              />
            )}
          </div>
        )}
      </div>

      {isLoading && <Loading />}
    </div>
  );
};

export default Network;
