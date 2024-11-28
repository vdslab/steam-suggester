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

const Network = () => {
  const [filter, setFilter] = useState<Filter>(DEFAULT_FILTER);

  const [nodes, setNodes] = useState<NodeType[]>([]);
  const [links, setLinks] = useState<LinkType[]>([]);
  const [centerX, setCenterX] = useState<number>(0);
  const [centerY, setCenterY] = useState<number>(0);

  const [selectedIndex, setSelectedIndex] = useState(-1);

  const [isLoading, setIsLoading] = useState(true);

  // New state variables for panel visibility
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

  // Function to determine center panel width
  const getCenterPanelWidth = () => {
    if (isLeftPanelOpen && isRightPanelOpen) return 'w-3/5';
    if (isLeftPanelOpen || isRightPanelOpen) return 'w-4/5';
    return 'w-full';
  };

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

  // Function to handle node selection and open the right panel automatically
  const handleSetSelectedIndex = (index: number) => {
    setSelectedIndex(index);
    if (index !== -1 && !isRightPanelOpen) {
      setIsRightPanelOpen(true);
    }
  };

  return (
    <div>
      {!isLoading ? 
        <div className="flex h-[92dvh] overflow-hidden">
          {/* Left Panel */}
          <div className={`${isLeftPanelOpen ? 'w-1/5' : 'w-0'} bg-stone-950 overflow-y-auto overflow-x-hidden transition-all duration-300`}>
            {isLeftPanelOpen && <SelectParameter filter={filter} setFilter={setFilter} />}
          </div>
          {/* Center Panel */}
          <div className={`${getCenterPanelWidth()} bg-gray-900 flex flex-col overflow-y-hidden overflow-x-hidden transition-all duration-300`}>
            <div className="flex justify-between p-2">
              <button 
                onClick={() => setIsLeftPanelOpen(!isLeftPanelOpen)}
                className="text-white bg-blue-600 hover:bg-blue-500 rounded px-4 py-2"
              >
                {isLeftPanelOpen ? 'フィルターを隠す' : 'フィルターを表示'}
              </button>
              <button 
                onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
                className="text-white bg-blue-600 hover:bg-blue-500 rounded px-4 py-2"
              >
                {isRightPanelOpen ? 'ゲームリストを隠す' : 'ゲームリストを表示'}
              </button>
            </div>
            <ChatBar nodes={nodes} setNodes={setNodes} />
            <NodeLink nodes={nodes} links={links} centerX={centerX} centerY={centerY} setSelectedIndex={handleSetSelectedIndex} />
          </div>
          {/* Right Panel */}
          <div className={`${isRightPanelOpen ? 'w-1/5' : 'w-0'} bg-stone-950 overflow-y-auto overflow-x-hidden transition-all duration-300`}>
            {isRightPanelOpen && (selectedIndex !== -1 ? 
              <Popup nodes={nodes} selectedIndex={selectedIndex} setSelectedIndex={setSelectedIndex} /> 
              : 
              <GameList nodes={nodes} setCenterX={setCenterX} setCenterY={setCenterY} setIsLoading={setIsLoading} />
            )}
          </div>
        </div> 
        : <Loading />
      }
    </div>
  );
}

export default Network;
