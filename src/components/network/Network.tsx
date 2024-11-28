/* Network.tsx */
"use client";  
import { useEffect, useState } from 'react';
import NodeLink from "./NodeLink";
import SelectParameter from './selectParameter/SelectParameter';
import { DEFAULT_FILTER } from '@/constants/DEFAULT_FILTER';
import { Filter } from '@/types/api/FilterType';
import GameList from './gameList/GameList';
import StreamedList from './streamedList/StreamedList'; // 配信者パネルのインポート
import createNetwork from '@/hooks/createNetwork';
import Loading from '@/app/desktop/loading';
import { LinkType, NodeType, StreamerListType } from '@/types/NetworkType';
import { getFilterData, getGameIdData } from '@/hooks/indexedDB';
import ChatBar from './chatBar/ChatBar';
import Sidebar from './Sidebar'; // Sidebar をインポート

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
  const [isEmphasisOpen, setIsEmphasisOpen] = useState<boolean>(false); // 強調パネルの状態管理

  const initialNodes = async (filter: Filter, gameIds: string[]) => {
    const result = await createNetwork(filter, gameIds);
    const nodes = result?.nodes ?? [];
    const links = result?.links ?? [];
    const buffNodes = nodes.concat();
    buffNodes.sort((node1: NodeType, node2: NodeType) => (node2.circleScale ?? 0) - (node1.circleScale ?? 0));
    if(centerX === 0 && centerY === 0 && buffNodes.length > 0) {
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

  // Sidebar のトグル関数
  const toggleFilter = () => setIsFilterOpen(prev => !prev);
  const toggleGameList = () => setIsGameListOpen(prev => !prev);
  const toggleEmphasis = () => setIsEmphasisOpen(prev => !prev); // 強調パネルのトグル関数

  if(isLoading) {
    return <Loading />;
  }

  return (
    <div className="flex h-[92dvh] overflow-hidden">
      {/* Sidebar を追加 */}
      <Sidebar
        isFilterOpen={isFilterOpen}
        toggleFilter={toggleFilter}
        isGameListOpen={isGameListOpen}
        toggleGameList={toggleGameList}
        isEmphasisOpen={isEmphasisOpen}
        toggleEmphasis={toggleEmphasis}
      />

      {/* フィルター パネル */}
      {isFilterOpen && (
        <div className="w-1/5 bg-stone-950 overflow-y-auto overflow-x-hidden">
          <SelectParameter filter={filter} setFilter={setFilter} />
        </div>
      )}

      {/* 強調パネル */}
      {isEmphasisOpen && (
        <div className="w-1/5 bg-stone-950 overflow-y-auto overflow-x-hidden">
          <div className="p-4 bg-gray-800 rounded-lg space-y-4">
            <h2 className="text-white mb-2">強調</h2>
            <ChatBar nodes={nodes} setNodes={setNodes} />
            <StreamedList nodes={nodes} streamerIds={streamerIds} setStreamerIds={setStreamerIds} />
          </div>
        </div>
      )}

      {/* メイン コンテンツ エリア */}
      <div className="flex-1 bg-gray-900 flex flex-col overflow-y-hidden overflow-x-hidden">
        <NodeLink nodes={nodes} links={links} centerX={centerX} centerY={centerY} setSelectedIndex={setSelectedIndex} streamerIds={streamerIds} />
      </div>

      {/* ゲームリスト パネル */}
      {isGameListOpen && (
        <div className="w-1/5 bg-stone-950 overflow-y-auto overflow-x-hidden">
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
}

export default Network;
