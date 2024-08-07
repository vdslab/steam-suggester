"use client";
import { useState } from 'react';
import NodeLink from "./NodeLink";
import SelectParameter from './selectParameter/SelectParameter';
import { DEFAULT_FILTER } from '@/constants/DEFAULT_FILTER';
import { Filter } from '@/types/api/FilterType';

const Network = () => {
  const [filter, setFilter] = useState<Filter>(DEFAULT_FILTER);

  return (
    <div className="flex h-[92dvh] overflow-hidden">
      <div className="w-1/4 bg-stone-950 overflow-y-auto overflow-x-hidden">
        <SelectParameter filter={filter} setFilter={setFilter} />
      </div>
      <div className="w-3/4 bg-gray-900 flex flex-col overflow-y-hidden overflow-x-hidden">
        <NodeLink filter={filter} />
      </div>
    </div>
  );
}

export default Network;
