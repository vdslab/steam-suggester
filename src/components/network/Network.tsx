"use client";
import { useEffect, useState } from 'react';
import NodeLink from "./NodeLink";
import SelectParameter from './selectParameter/SelectParameter';
import { DEFAULT_FILTER } from '@/constants/DEFAULT_FILTER';
import { Filter } from '@/types/api/FilterType';
import GameList from './gameList/GameList';
import StreamedList from './streamedList/StreamedList';
import createNetwork from '@/hooks/createNetwork';
import Loading from '@/app/desktop/loading';
import { LinkType, NodeType, StreamerListType } from '@/types/NetworkType';
import { getFilterData, getGameIdData } from '@/hooks/indexedDB';
import ChatBar from './chatBar/ChatBar';
import Popup from './Popup';

const Network = () => {
  const [filter, setFilter] = useState<Filter>(DEFAULT_FILTER);

  const [nodes, setNodes] = useState<NodeType[]>([]);
  const [links, setLinks] = useState<LinkType[]>([]);
  const [centerX, setCenterX] = useState<number>(0);
  const [centerY, setCenterY] = useState<number>(0);
  const [streamerIds, setStreamerIds] = useState<StreamerListType[]>([]); 

  const [selectedIndex, setSelectedIndex] = useState(-1);

  const [isLoading, setIsLoading] = useState(true);

  const initialNodes = async (filter: Filter, gameIds: string[]) => {
    const result = await createNetwork(filter, gameIds);
    const nodes = result?.nodes ?? [];
    const links = result?.links ?? [];
    const buffNodes = nodes.concat();
    buffNodes.sort((node1: NodeType, node2: NodeType) => (node2.circleScale ?? 0) - (node1.circleScale ?? 0));
    if(centerX === 0 && centerY === 0 && buffNodes.length > 0) {
      setCenterX(buffNodes[0].x ?? 0);
      setCenterY(buffNodes[0].y ?? 0);
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

  return (
    <div>
      {!isLoading ? (
        <div className="flex h-[92dvh] overflow-hidden">
          {/* 左サイドバー */}
          <div className="w-1/5 bg-stone-950 overflow-y-auto p-4">
            <StreamedList nodes={nodes} streamerIds={streamerIds} setStreamerIds={setStreamerIds} />
            <SelectParameter filter={filter} setFilter={setFilter} />
          </div>

          {/* 中央コンテンツ */}
          <div className="w-3/5 bg-gray-900 flex flex-col overflow-y-hidden p-4">
            {/* NodeLink */}
            <div className="flex-1 mb-4">
              <NodeLink 
                nodes={nodes} 
                links={links} 
                centerX={centerX} 
                centerY={centerY} 
                setSelectedIndex={setSelectedIndex} 
                streamerIds={streamerIds} 
              />
            </div>

            {/* ChatBarとStreamedList */}
            <div className="flex flex-col h-1/3">
              <ChatBar nodes={nodes} setNodes={setNodes} />
              <StreamedList nodes={nodes} streamerIds={streamerIds} setStreamerIds={setStreamerIds} />
            </div>
          </div>

          {/* 右サイドバー */}
          <div className="w-1/5 bg-stone-950 overflow-y-auto p-4">
            {selectedIndex !== -1 ? 
              <Popup nodes={nodes} selectedIndex={selectedIndex} setSelectedIndex={setSelectedIndex} /> 
              : 
              <GameList 
                nodes={nodes} 
                setCenterX={setCenterX} 
                setCenterY={setCenterY} 
                setIsLoading={setIsLoading} 
              />
            }
          </div>
        </div> 
        ) : (
          <Loading />
        )
      }
    </div>
  );
}

export default Network;
