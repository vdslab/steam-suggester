/* SelectParameter.tsx */
"use client";
import { DEFAULT_FILTER, DEVICE_MAPPING, GENRE_MAPPING, MODE_MAPPING } from "@/constants/DEFAULT_FILTER";
import { changeFilterData } from "@/hooks/indexedDB";
import { Filter } from "@/types/api/FilterType";
import { useState, useEffect } from "react";
import FilterHeadline from "./FilterHeadline";
import FilterButtonGroup from "./FilterButtonGroup";
import FilterSlider from "./FilterSlider";

type Props = {
  filter: Filter;
  setFilter: React.Dispatch<React.SetStateAction<Filter>>;
};

const SelectParameter = (props: Props) => {
  const { filter, setFilter } = props;

  // ... existing logic ...

  return (
    <div className="p-4" style={{ maxHeight: '100vh', overflowY: 'auto' }}>
      <h2 className="text-white text-xl mb-4">フィルター</h2>
      <p className="text-gray-400 mb-4">条件を指定してネットワーク上のゲームを絞り込みましょう。</p>

      {/* Genre Filter */}
      <FilterHeadline title="ジャンル" />
      {/* ... existing genre filter components ... */}

      {/* Price Filter */}
      <FilterHeadline title="価格" />
      {/* ... existing price filter components ... */}

      {/* Mode Filter */}
      <FilterHeadline title="モード" />
      {/* ... existing mode filter components ... */}

      {/* Device Filter */}
      <FilterHeadline title="対応デバイス" />
      {/* ... existing device filter components ... */}

      <div className="mt-4">
        <button
          className="text-white bg-blue-600 hover:bg-blue-500 rounded px-4 py-2 w-full mb-2"
          onClick={() => handleClickFilter(localFilter)}
        >
          フィルターを適用
        </button>
        <button
          onClick={() => handleClickFilter(DEFAULT_FILTER)}
          className="text-white border border-gray-500 hover:bg-gray-700 rounded px-4 py-2 w-full"
        >
          フィルターを解除
        </button>
      </div>
    </div>
  );
};

export default SelectParameter;
