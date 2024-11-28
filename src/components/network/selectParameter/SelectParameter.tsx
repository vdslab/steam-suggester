"use client";

import {
  DEFAULT_FILTER,
  DEVICE_MAPPING,
  GENRE_MAPPING,
  MODE_MAPPING,
} from "@/constants/DEFAULT_FILTER";
import { changeFilterData } from "@/hooks/indexedDB";
import { Filter } from "@/types/api/FilterType";
import { useState, useEffect } from "react";
import FilterHeadline from "./FilterHeadline";
import FilterButtonGroup from "./FilterButtonGroup";
import FilterSlider from "./FilterSlider";
import Panel from "../Panel";
import FilterListIcon from "@mui/icons-material/FilterList";
import CategoryIcon from "@mui/icons-material/Category";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import SettingsIcon from "@mui/icons-material/Settings";
import DevicesIcon from "@mui/icons-material/Devices";
import Section from "../Section";

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
    } else {
      setIsFreeChecked(false);
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

  // カテゴリーの全選択/全解除
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
    <Panel title="フィルター" icon={<FilterListIcon className="mr-2" />}>
          <p className="text-gray-400 mb-2">フィルターを適用することでゲームの絞り込みができます。</p>
        {/* ジャンルフィルター */}
      <Section title="ジャンル" icon={<CategoryIcon />}>
        <label className="flex items-center mb-2">
          <input
            type="checkbox"
            className="form-checkbox h-5 w-5 text-gray-600"
            checked={areAllCategoriesSelected}
            onChange={handleMasterCheckboxChange}
          />
          <span className="ml-2 text-white">全選択</span>
        </label>
        <FilterButtonGroup
          title="Categories"
          mapping={GENRE_MAPPING}
          localFilter={localFilter}
          setLocalFilter={setLocalFilter}
          rowLevel={3}
        />
      </Section>

      {/* 価格フィルター */}
      <Section title="価格" icon={<AttachMoneyIcon />}>
        <div className="flex items-center mb-4">
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
      </Section>

      {/* モードフィルター */}
      <Section title="モード" icon={<SettingsIcon />}>
        <FilterButtonGroup
          title="Mode"
          mapping={MODE_MAPPING}
          localFilter={localFilter}
          setLocalFilter={setLocalFilter}
          rowLevel={2}
        />
      </Section>

      {/* 対応デバイスフィルター */}
      <Section title="対応デバイス" icon={<DevicesIcon />}>
        <FilterButtonGroup
          title="Device"
          mapping={DEVICE_MAPPING}
          localFilter={localFilter}
          setLocalFilter={setLocalFilter}
          rowLevel={2}
        />
      </Section>

      {/* フィルターの適用ボタン */}
      <div className="mt-auto space-y-2">
        <button
          className="w-full text-white rounded px-4 py-2 bg-blue-600 hover:bg-blue-500"
          onClick={() => handleClickFilter(localFilter)}
        >
          フィルターを適用
        </button>
      </div>
    </Panel>
  );
};

export default SelectParameter;
