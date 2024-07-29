"use client";
import { useEffect, useState } from 'react';
import NodeLink from "./NodeLink";
import SelectParameter from './selectParameter/SelectParameter';
import { DEFAULT_FILTER } from '@/constants/DEFAULT_FILTER';
import { Filter } from '@/types/api/FilterType';
import GameList from './gameList/GameList';
import createNetwork from '@/hooks/createNetwork';
import Loading from '@/app/desktop/loading';

const Network = () => {
  const [filter, setFilter] = useState<Filter>(DEFAULT_FILTER);

  const [nodes, setNodes] = useState<any>([]);
  const [links, setLinks] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { nodes, links } = await createNetwork();
      setNodes(nodes);
      setLinks(links);
      setIsLoading(false);
    })();
  }, [filter]);

  return (
    <div>
      {!isLoading ? <div className="flex h-[92dvh] overflow-hidden">
        <div className="w-1/5 bg-stone-950 overflow-y-auto overflow-x-hidden">
          <SelectParameter filter={filter} setFilter={setFilter} />
        </div>
        <div className="w-3/5 bg-gray-900 flex flex-col overflow-y-hidden overflow-x-hidden">
          <NodeLink nodes={nodes} links={links} />
        </div>
        <div className="w-1/5 bg-stone-950 overflow-y-auto overflow-x-hidden">
          <GameList />
        </div>
      </div> : <Loading />
      }
    </div>
    
  );
}

export default Network;
