"use client";
import { DEFAULT_FILTER, DEVICE_MAPPING, GENRE_MAPPING, MODE_MAPPING } from "@/constants/DEFAULT_FILTER";
import { addFilterData, getFilterData, updateFilterData } from "@/hooks/indexedDB";
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

  const [localFilter, setLocalFilter] = useState<Filter>(filter);
  const [isFreeChecked, setIsFreeChecked] = useState<boolean>(false);

  useEffect(() => {
    (async() => {
      const d = await getFilterData('unique_id');
      if(d) {
        setFilter(d);
        setLocalFilter(d);
        if(d.Price.startPrice === 0 && d.Price.endPrice === 0) {
          setIsFreeChecked(true);
        }
      }
    })();
  }, [])

  const handlePriceChange = (values: number[]) => {
    const newFilter = {
      ...localFilter,
      Price: {
        startPrice: values[0],
        endPrice: values[1]
      }
    };
    setLocalFilter(newFilter);
  };

  const handleFreeCheckboxChange = () => {
    setIsFreeChecked(!isFreeChecked);
    const newFilter = { ...localFilter };
    newFilter['Price'].startPrice = !isFreeChecked ? 0 : localFilter.Price.startPrice;
    newFilter['Price'].endPrice = !isFreeChecked ? 0 : localFilter.Price.endPrice;
    setLocalFilter(newFilter);
  };

  const handleClickFilter = (filter: Filter) => {
    (async() => {
      const d = await getFilterData('unique_id');
      if(d) {
        updateFilterData(filter);
      } else {
        addFilterData(filter);
      }
    })();
    setFilter(filter)
    setLocalFilter(filter)
    if(filter === DEFAULT_FILTER) {
      setIsFreeChecked(false);
    }
  }

  // カテゴリーの全選択解除
  const handleAllCategories = (isAll: boolean) => {
    const newFilter = { ...localFilter.Categories };
    for (let key in newFilter) {
      newFilter[key] = isAll;
    }

    setLocalFilter({
      ...localFilter,
      Categories: newFilter
    });
  };


  return (
    <div style={{ maxHeight: '92vh', overflowY: 'auto', paddingBottom: '120px'}}>
      <FilterHeadline title="カテゴリー"/>
      <div className="p-2">
        <button
          onClick={() => handleAllCategories(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white rounded px-4 py-2 mr-2"
        >
          全選択
        </button>
        <button
          onClick={() => handleAllCategories(false)}
          className="bg-red-600 hover:bg-red-500 text-white rounded px-4 py-2"
        >
          全解除
        </button>
      </div>
      <FilterButtonGroup
        title="Categories"
        mapping={GENRE_MAPPING}
        localFilter={localFilter}
        setLocalFilter={setLocalFilter}
        rowLevel={3}
      />
      <div className="relative mb-4">
        <FilterHeadline title="価格"/>

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
              valueFormatter={(value) => (value === 1 ? '1円' : `${(value)}円`)}
              disabled={isFreeChecked}
            />
          </div>
        </div>
      </div>
      <FilterHeadline title="モード"/>
      <FilterButtonGroup
        title="Mode"
        mapping={MODE_MAPPING}
        localFilter={localFilter}
        setLocalFilter={setLocalFilter}
        rowLevel={2}
      />

      <FilterHeadline title="対応デバイス"/>
      <FilterButtonGroup
        title="Device"
        mapping={DEVICE_MAPPING}
        localFilter={localFilter}
        setLocalFilter={setLocalFilter}
        rowLevel={2}
      />
        
      <div className="absolute bottom-0 left-0 p-4 w-[calc(25%-12px)] z-10" style={{ backgroundColor: 'rgba(0, 0, 0, 0.1)', backdropFilter: 'blur(10px)'}}>
        <button
          className="text-white rounded px-4 py-2 bg-blue-600 hover:bg-blue-500 w-full mb-2"
          onClick={() => handleClickFilter(localFilter)}
        >
          フィルターを適用
        </button>
        <button
          onClick={() => handleClickFilter(DEFAULT_FILTER)}
          className="text-white rounded px-4 py-2 w-full"
        >
          フィルターを解除
        </button>
      </div>
    </div>
  );
};

export default SelectParameter;
