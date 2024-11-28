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

  // パネルの表示状態を管理するステート
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

  // ノード選択時に右パネルを自動的に開く関数
  const handleSetSelectedIndex = (index: number) => {
    setSelectedIndex(index);
    if (index !== -1) {
      setActivePanel('gamelist');
    }
  };

  return (
    <div className="flex h-screen">
      {/* ナビゲーションサイドバー */}
      <div className="w-32 bg-stone-900 flex flex-col items-center py-4">
        <button
          className={`mb-4 px-4 py-2 text-white ${activePanel === 'filter' ? 'bg-blue-600' : 'bg-gray-800'} rounded`}
          onClick={() => setActivePanel(activePanel === 'filter' ? null : 'filter')}
        >
          フィルター
        </button>
        <button
          className={`mb-4 px-4 py-2 text-white ${activePanel === 'chat' ? 'bg-blue-600' : 'bg-gray-800'} rounded`}
          onClick={() => setActivePanel(activePanel === 'chat' ? null : 'chat')}
        >
          チャット
        </button>
        <button
          className={`px-4 py-2 text-white ${activePanel === 'gamelist' ? 'bg-blue-600' : 'bg-gray-800'} rounded`}
          onClick={() => setActivePanel(activePanel === 'gamelist' ? null : 'gamelist')}
        >
          ゲームリスト
        </button>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 flex">
        {/* 左パネル */}
        {activePanel === 'filter' && (
          <div className="w-64 bg-stone-900 overflow-y-auto">
            <SelectParameter filter={filter} setFilter={setFilter} />
          </div>
        )}

        {/* 中央パネル */}
        <div className="flex-1 bg-gray-900 relative">
          {/* チャットバー（アクティブ時に表示） */}
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

        {/* 右パネル */}
        {activePanel === 'gamelist' && (
          <div className="w-64 bg-stone-900 overflow-y-auto">
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
