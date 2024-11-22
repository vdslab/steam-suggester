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
import { Tabs, Tab, AppBar, Toolbar, Typography, Box } from '@mui/material';

const Network = () => {
  const [filter, setFilter] = useState<Filter>(DEFAULT_FILTER);
  const [nodes, setNodes] = useState<NodeType[]>([]);
  const [links, setLinks] = useState<LinkType[]>([]);
  const [centerX, setCenterX] = useState<number>(0);
  const [centerY, setCenterY] = useState<number>(0);
  const [streamerIds, setStreamerIds] = useState<StreamerListType[]>([]); 
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(true);
  const [rightTabIndex, setRightTabIndex] = useState<number>(0);

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
    <div className="h-screen flex flex-col">
      {/* ヘッダー */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" className="flex-grow">
            Game Network Visualization
          </Typography>
        </Toolbar>
      </AppBar>

      {/* メインコンテンツ */}
      {!isLoading ? (
        <div className="flex flex-grow">
          {/* 左サイドバー */}
          <div className="w-1/5 bg-gray-800 p-4 overflow-y-auto">
            <Typography variant="h6" className="text-white mb-4">
              フィルター設定
            </Typography>
            <SelectParameter filter={filter} setFilter={setFilter} />
          </div>

          {/* 中央コンテンツ */}
          <div className="w-3/5 bg-gray-900 flex flex-col">
            {/* NodeLink */}
            <div className="flex-1">
              <NodeLink 
                nodes={nodes} 
                links={links} 
                centerX={centerX} 
                centerY={centerY} 
                setSelectedIndex={setSelectedIndex} 
                streamerIds={streamerIds} 
              />
            </div>
            {/* ChatBar */}
            <div className="p-4">
              <ChatBar nodes={nodes} setNodes={setNodes} />
            </div>
          </div>

          {/* 右サイドバー */}
          <div className="w-1/5 bg-gray-800 p-4 overflow-y-auto">
            <Tabs
              value={rightTabIndex}
              onChange={(e, newValue) => setRightTabIndex(newValue)}
              indicatorColor="primary"
              textColor="inherit"
              variant="fullWidth"
            >
              <Tab label="配信者リスト" />
              <Tab label="ゲームリスト" />
            </Tabs>
            <Box className="mt-4">
              {rightTabIndex === 0 && (
                <StreamedList 
                  nodes={nodes} 
                  streamerIds={streamerIds} 
                  setStreamerIds={setStreamerIds} 
                />
              )}
              {rightTabIndex === 1 && (
                <GameList 
                  nodes={nodes} 
                  setCenterX={setCenterX} 
                  setCenterY={setCenterY} 
                  setIsLoading={setIsLoading} 
                />
              )}
            </Box>
          </div>
        </div>
      ) : (
        <Loading />
      )}
    </div>
  );
}

export default Network;