/* Network.tsx */
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
import { IconButton, Drawer, Tabs, Tab, AppBar, Toolbar } from '@mui/material';
import { Menu as MenuIcon, ChevronLeft as ChevronLeftIcon } from '@mui/icons-material';

const Network = () => {
  const [filter, setFilter] = useState<Filter>(DEFAULT_FILTER);

  const [nodes, setNodes] = useState<NodeType[]>([]);
  const [links, setLinks] = useState<LinkType[]>([]);
  const [centerX, setCenterX] = useState<number>(0);
  const [centerY, setCenterY] = useState<number>(0);
  const [streamerIds, setStreamerIds] = useState<StreamerListType[]>([]); 

  const [selectedIndex, setSelectedIndex] = useState(-1);

  const [isLoading, setIsLoading] = useState(true);

  // 折り畳み状態の管理
  const [leftDrawerOpen, setLeftDrawerOpen] = useState<boolean>(false);
  const [rightDrawerOpen, setRightDrawerOpen] = useState<boolean>(false);

  // タブの状態管理
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
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open left drawer"
            onClick={() => setLeftDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>
          <h1 className="flex-grow text-center text-lg">Game Network Visualization</h1>
          <IconButton
            edge="end"
            color="inherit"
            aria-label="open right drawer"
            onClick={() => setRightDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* メインコンテンツ */}
      {!isLoading ? (
        <div className="flex flex-grow overflow-hidden">
          {/* 左サイドバー */}
          <Drawer
            variant="temporary"
            open={leftDrawerOpen}
            onClose={() => setLeftDrawerOpen(false)}
            anchor="left"
          >
            <div className="w-64 bg-stone-950 h-full p-4 flex flex-col">
              <IconButton onClick={() => setLeftDrawerOpen(false)}>
                <ChevronLeftIcon className="text-white" />
              </IconButton>
              <div className="flex flex-col space-y-4 mt-4 overflow-y-auto">
                {/* SelectParameter */}
                <SelectParameter 
                  filter={filter} 
                  setFilter={setFilter} 
                />
              </div>
            </div>
          </Drawer>

          {/* NodeLink */}
          <div className="flex-grow bg-gray-900">
            <NodeLink 
              nodes={nodes} 
              links={links} 
              centerX={centerX} 
              centerY={centerY} 
              setSelectedIndex={setSelectedIndex} 
              streamerIds={streamerIds} 
            />
          </div>

          {/* 右サイドバー */}
          <Drawer
            variant="temporary"
            open={rightDrawerOpen}
            onClose={() => setRightDrawerOpen(false)}
            anchor="right"
          >
            <div className="w-64 bg-stone-950 h-full flex flex-col">
              <IconButton onClick={() => setRightDrawerOpen(false)}>
                <ChevronLeftIcon className="text-white transform rotate-180" />
              </IconButton>
              {/* タブでコンテンツを切り替え */}
              <Tabs
                value={rightTabIndex}
                onChange={(e, newValue) => setRightTabIndex(newValue)}
                variant="fullWidth"
                indicatorColor="primary"
                textColor="inherit"
              >
                <Tab label="Streamers" />
                <Tab label="Chat" />
              </Tabs>
              <div className="flex-grow overflow-y-auto p-4">
                {rightTabIndex === 0 && (
                  <StreamedList 
                    nodes={nodes} 
                    streamerIds={streamerIds} 
                    setStreamerIds={setStreamerIds} 
                  />
                )}
                {rightTabIndex === 1 && (
                  <ChatBar nodes={nodes} setNodes={setNodes} />
                )}
              </div>
            </div>
          </Drawer>
        </div>
      ) : (
        <Loading />
      )}
    </div>
  );
}

export default Network;
