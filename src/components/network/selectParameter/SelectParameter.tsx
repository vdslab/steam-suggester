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

const SelectParameter: React.FC<Props> = ({ filter, setFilter }) => {
  const [localFilter, setLocalFilter] = useState<Filter>(filter);
  const [isFreeChecked, setIsFreeChecked] = useState<boolean>(false);
  const [areAllCategoriesSelected, setAreAllCategoriesSelected] = useState<boolean>(false);

  useEffect(() => {
    if (filter.Price.startPrice === 0 && filter.Price.endPrice === 0) {
      setIsFreeChecked(true);
    }
  }, [filter]);

  const handlePriceChange = (values: number[]) => {
    const newFilter = {
      ...localFilter,
      Price: {
        startPrice: values[0],
        endPrice: values[1],
      },
    };
    setLocalFilter(newFilter);
  };

  const handleFreeCheckboxChange = () => {
    setIsFreeChecked(!isFreeChecked);
    const newFilter = { ...localFilter };
    if (!isFreeChecked) {
      newFilter.Price.startPrice = 0;
      newFilter.Price.endPrice = 0;
    } else {
      newFilter.Price.startPrice = DEFAULT_FILTER.Price.startPrice;
      newFilter.Price.endPrice = DEFAULT_FILTER.Price.endPrice;
    }
    setLocalFilter(newFilter);
  };

  const handleClickFilter = (filter: Filter) => {
    changeFilterData(filter);
    setFilter(filter);
    setLocalFilter(filter);
    if (filter === DEFAULT_FILTER) {
      setIsFreeChecked(false);
    }
  };

  // カテゴリーの全選択解除
  const handleAllCategories = (isAll: boolean) => {
    const newFilter = { ...localFilter.Categories };
    for (let key in newFilter) {
      newFilter[key] = isAll;
    }

    setLocalFilter({
      ...localFilter,
      Categories: newFilter,
    });
  };

  const handleMasterCheckboxChange = () => {
    const newStatus = !areAllCategoriesSelected;
    const newCategories: { [key: string]: boolean } = {};
    for (const key in localFilter.Categories) {
      newCategories[key] = newStatus;
    }
    setLocalFilter({
      ...localFilter,
      Categories: newCategories,
    });
    setAreAllCategoriesSelected(newStatus);
  };

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex-1 overflow-y-auto">
        <FilterHeadline title="ジャンル" />
        <label className="flex items-center m-2">
          <input
            type="checkbox"
            className="form-checkbox h-5 w-5 text-gray-600"
            checked={areAllCategoriesSelected}
            onChange={handleMasterCheckboxChange}
          />
          <span className="ml-2 text-white">全選択</span>
        </label>
        {/* <div className="p-2 flex justify-between">
          <button
            onClick={() => handleAllCategories(true)}
            className="bg-green-700 hover:bg-green-600 text-white rounded px-4 py-2 mr-2 flex-1"
          >
            全選択
          </button>
          <button
            onClick={() => handleAllCategories(false)}
            className="border border-green-600 text-green-600 hover:bg-sky-950 rounded px-4 py-2 flex-1 ml-2"
          >
            全解除
          </button>
        </div> */}
        <FilterButtonGroup
          title="Categories"
          mapping={GENRE_MAPPING}
          localFilter={localFilter}
          setLocalFilter={setLocalFilter}
          rowLevel={3}
        />
        <div className="relative mb-4">
          <FilterHeadline title="価格" />

          <div className="rounded mt-1 w-full z-10 overflow-hidden">
            <div className="p-4 text-white">
              <div className="mb-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-gray-600"
                    checked={isFreeChecked}
                    onChange={handleFreeCheckboxChange}
                  />
                  <span className="ml-2 text-white">無料</span>
                </label>
              </div>
              <FilterSlider
                domain={[0, 10000]}
                values={[localFilter.Price.startPrice, localFilter.Price.endPrice]}
                onChange={handlePriceChange}
                valueFormatter={(value) => (value === 1 ? "1円" : `${value}円`)}
                disabled={isFreeChecked}
              />
            </div>
          </div>
        </div>
        <FilterHeadline title="モード" />
        <FilterButtonGroup
          title="Mode"
          mapping={MODE_MAPPING}
          localFilter={localFilter}
          setLocalFilter={setLocalFilter}
          rowLevel={2}
        />

        <FilterHeadline title="対応デバイス" />
        <FilterButtonGroup
          title="Device"
          mapping={DEVICE_MAPPING}
          localFilter={localFilter}
          setLocalFilter={setLocalFilter}
          rowLevel={2}
        />
      </div>

      {/* フィルターの適用と解除ボタン */}
      <div className="mt-4">
        <button
          className="w-full text-white rounded px-4 py-2 bg-blue-600 hover:bg-blue-500 mb-2"
          onClick={() => handleClickFilter(localFilter)}
        >
          フィルターを適用
        </button>
        {/* <button
          onClick={() => handleClickFilter(DEFAULT_FILTER)}
          className="w-full text-white rounded px-4 py-2 bg-red-800 hover:bg-red-600"
        >
          リセット
        </button> */}
      </div>
    </div>
  );
};

export default SelectParameter;
