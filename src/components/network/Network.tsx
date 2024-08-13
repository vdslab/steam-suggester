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

const Network = () => {
  const [filter, setFilter] = useState<Filter>(DEFAULT_FILTER);

  const [nodes, setNodes] = useState<NodeType[]>([]);
  const [links, setLinks] = useState<LinkType[]>([]);
  const [centerX, setCenterX] = useState<number>(0);
  const [centerY, setCenterY] = useState<number>(0);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const result = await createNetwork();
      const nodes = result?.nodes ?? [];
      const links = result?.links ?? [];
      const buffNodes = nodes.concat();
      buffNodes.sort((node1: NodeType, node2: NodeType) => (node2.circleScale ?? 0) - (node1.circleScale ?? 0));
      setCenterX(buffNodes[0]?.x ?? 0);
      setCenterY(buffNodes[0]?.y ?? 0);
      setNodes(nodes);
      setLinks(links);
    })();
  }, [filter]);

  useEffect(() => {
    if(centerX && centerY) {
      setIsLoading(false);
    }
  });

  return (
    <div>
      {!isLoading ? <div className="flex h-[92dvh] overflow-hidden">
        <div className="w-1/5 bg-stone-950 overflow-y-auto overflow-x-hidden">
          <SelectParameter filter={filter} setFilter={setFilter} />
        </div>
        <div className="w-3/5 bg-gray-900 flex flex-col overflow-y-hidden overflow-x-hidden">
          <NodeLink nodes={nodes} links={links} centerX={centerX} centerY={centerY}/>
        </div>
        <div className="w-1/5 bg-stone-950 overflow-y-auto overflow-x-hidden">
          <GameList nodes={nodes} setCenterX={setCenterX} setCenterY={setCenterY} />
        </div>
      </div> : <Loading />
      }
    </div>
    
  );
}

export default Network;
