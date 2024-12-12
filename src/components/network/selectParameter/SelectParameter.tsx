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
import FilterButtonGroup from "./FilterButtonGroup";
import Panel from "../Panel";
import FilterListIcon from "@mui/icons-material/FilterList";
import CategoryIcon from "@mui/icons-material/Category";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import SettingsIcon from "@mui/icons-material/Settings";
import DevicesIcon from "@mui/icons-material/Devices";
import Section from "../Section";
import HelpTooltip from "../HelpTooltip"; // 追加

type Props = {
  filter: Filter;
  setFilter: React.Dispatch<React.SetStateAction<Filter>>;
  setIsLoading?: React.Dispatch<React.SetStateAction<boolean>>;
  setIsNetworkLoading?: React.Dispatch<React.SetStateAction<boolean>>;
};

const SelectParameter: React.FC<Props> = ({ filter, setFilter, setIsLoading, setIsNetworkLoading }) => {
  const [localFilter, setLocalFilter] = useState<Filter>(filter);
  const [isFreeChecked, setIsFreeChecked] = useState<boolean>(false);
  const [areAllCategoriesSelected, setAreAllCategoriesSelected] = useState<boolean>(false);
  const [previousPrice, setPreviousPrice] = useState<{ startPrice: number; endPrice: number } | null>(null);

  useEffect(() => {
    if (filter.Price.startPrice === 0 && filter.Price.endPrice === 0) {
      setIsFreeChecked(true);
    } else {
      setIsFreeChecked(false);
      setPreviousPrice({ startPrice: filter.Price.startPrice, endPrice: filter.Price.endPrice });
    }

    // カテゴリーの全選択状態を更新
    const allSelected = Object.values(filter.Genres).every((value) => value);
    setAreAllCategoriesSelected(allSelected);
  }, [filter]);

  const handlePriceChange = (field: "startPrice" | "endPrice", value: number) => {
    const newPrice = { ...localFilter.Price, [field]: value };
    setLocalFilter({ ...localFilter, Price: newPrice });
  };

  const handleFreeCheckboxChange = () => {
    if (!isFreeChecked) {
      // 無料にチェックを入れる前の価格を保存
      setPreviousPrice({ startPrice: localFilter.Price.startPrice, endPrice: localFilter.Price.endPrice });
      setLocalFilter({ ...localFilter, Price: { startPrice: 0, endPrice: 0 } });
    } else {
      // 無料のチェックを外す際に保存した価格を復元
      if (previousPrice) {
        setLocalFilter({ ...localFilter, Price: previousPrice });
      } else {
        setLocalFilter({ ...localFilter, Price: DEFAULT_FILTER.Price });
      }
    }
    setIsFreeChecked(!isFreeChecked);
  };

  const handleClickFilter = (filter: Filter) => {
    (async () => {
      await changeFilterData(filter);
      // TODO:
      if (setIsNetworkLoading) {
        setIsNetworkLoading(true);
      } else if (setIsLoading) {
        setIsLoading(true);
      }
    })();

    setFilter(filter);
    setLocalFilter(filter);
    if (filter.Price.startPrice === 0 && filter.Price.endPrice === 0) {
      setIsFreeChecked(true);
    } else {
      setIsFreeChecked(false);
    }
  };

  // カテゴリーの全選択/全解除
  const handleMasterCheckboxChange = () => {
    const newStatus = !areAllCategoriesSelected;
    const newCategories: { [key: string]: boolean } = {};
    for (const key in localFilter.Genres) {
      newCategories[key] = newStatus;
    }
    setLocalFilter({
      ...localFilter,
      Genres: newCategories,
    });
    setAreAllCategoriesSelected(newStatus);
  };

  return (
    <Panel
      title={
        <div className="flex items-center">
          <span>フィルター</span>
          <HelpTooltip title="フィルターを適用することでゲームの絞り込みができます。" />
        </div>
      }
      icon={<FilterListIcon className="mr-2 text-white" />}
    >
      <div className="flex flex-col h-full">
        {/* 既存の説明テキストを削除 */}
        
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
          title="Genres"
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
          <div className="flex items-center space-x-2">
            <input
              type="number"
              min="0"
              value={localFilter.Price.startPrice}
              onChange={(e) => handlePriceChange("startPrice", Number(e.target.value))}
              disabled={isFreeChecked}
              className={`w-1/2 px-3 py-2 bg-gray-700 text-white rounded ${
                isFreeChecked ? "opacity-50 cursor-not-allowed" : ""
              }`}
              placeholder="0"
            />
            <span className="text-white">～</span>
            <input
              type="number"
              min="0"
              value={localFilter.Price.endPrice}
              onChange={(e) => handlePriceChange("endPrice", Number(e.target.value))}
              disabled={isFreeChecked}
              className={`w-1/2 px-3 py-2 bg-gray-700 text-white rounded ${
                isFreeChecked ? "opacity-50 cursor-not-allowed" : ""
              }`}
              placeholder="10000"
            />
          </div>
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
        <div className="sticky bottom-0 bg-gray-800 p-4">
          <button
            className="w-full text-white rounded px-4 py-2 bg-blue-600 hover:bg-blue-500"
            onClick={() => handleClickFilter(localFilter)}
          >
            フィルターを適用
          </button>
        </div>
      </div>
    </Panel>
  );
};

export default SelectParameter;
