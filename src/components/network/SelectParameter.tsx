"use client";
import { DEFAULT_FILTER } from "@/constants/DEFAULT_FILTER";
import { addFilterData, getFilterData, updateFilterData } from "@/hooks/indexedDB";
import { Filter } from "@/types/api/FilterType";
import { useState, useEffect } from "react";
import { Slider, Rail, Handles, Tracks } from 'react-compound-slider';

// マッピングデータ
const genreMapping: any = {
  1: "アクション",
  37: "無料プレイ",
  2: "ストラテジー",
  25: "アドベンチャー",
  23: "インディー",
  3: "RPG",
  51: "アニメーション & モデリング",
  58: "Video Production",
  4: "カジュアル",
  28: "シミュレーション",
  9: "レース",
  73: "Violent",
  29: "MM（Massively Multiplayer）",
  72: "Nudity",
  18: "スポーツ",
  70: "早期アクセス",
  74: "Gore",
  57: "ユーティリティ",
  52: "Audio Production",
  53: "デザイン & イラストレーション",
  59: "Web Publishing",
  55: "写真編集",
  54: "Education",
  56: "Software Training",
  71: "Sexual Content",
  60: "Game Development",
  50: "Accounting",
  81: "Documentary",
  84: "Tutorial"
};

const modeMapping: any = {
  isSinglePlayer: "シングルプレイヤー",
  isMultiPlayer: "マルチプレイヤー"
};

const deviceMapping: any = {
  windows: "windows",
  mac: "mac"
};

const SliderFilter = ({ min, max, values, onChange, valueFormatter, disabled }: { min: number, max: number, values: number[], onChange: (values: number[]) => void, valueFormatter: (value: number) => string, disabled: boolean }) => {
  const [domain] = useState([min, max]);

  const handleChange = (newValues: readonly number[]) => {
    onChange([...newValues]);
  };

  return (
    <div style={{ margin: '10px 0', opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? 'none' : 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <span>{valueFormatter(values[0])}</span>
        <span>{valueFormatter(values[1])}</span>
      </div>
      <Slider
        mode={2}
        step={1}
        domain={domain}
        rootStyle={{ position: 'relative', width: '100%' }}
        onUpdate={handleChange}
        values={values}
      >
        <Rail>
          {({ getRailProps }) => (
            <div style={{ position: 'absolute', width: '100%', height: 8, borderRadius: 4, backgroundColor: '#ddd' }} {...getRailProps()} />
          )}
        </Rail>
        <Handles>
          {({ handles, getHandleProps }) => (
            <div className="slider-handles">
              {handles.map(handle => (
                <div key={handle.id} style={{ left: `${handle.percent}%`, position: 'absolute', marginLeft: -11, marginTop: -5, zIndex: 2, width: 20, height: 20, cursor: 'pointer', backgroundColor: '#fff', borderRadius: '50%' }} {...getHandleProps(handle.id)} />
              ))}
            </div>
          )}
        </Handles>
        <Tracks left={false} right={false}>
          {({ tracks, getTrackProps }) => (
            <div className="slider-tracks">
              {tracks.map(({ id, source, target }) => (
                <div key={id} style={{ position: 'absolute', height: 8, zIndex: 1, backgroundColor: '#548BF4', borderRadius: 4, left: `${source.percent}%`, width: `${target.percent - source.percent}%` }} {...getTrackProps()} />
              ))}
            </div>
          )}
        </Tracks>
      </Slider>
    </div>
  );
};

const Dropdown = ({ displayTag, title, mapping, localFilter, setLocalFilter }: { displayTag: string, title: string, mapping: any, localFilter: any, setLocalFilter:  React.Dispatch<React.SetStateAction<Filter>> }) => {
  const handleChangeFilter = (key: number) => {
    setLocalFilter((prev:any) => {
      return {
        ...prev,
        [title]: {
          ...prev[title],
          [key]: !prev[title][key],
        },
      }
    });
  };

  const handleSelectAll = () => {
      setLocalFilter((prev: any) => {
        const newFilter = { ...prev[title] };
        Object.keys(mapping).forEach((key) => {
          newFilter[key] = true;
        });
        return {
          ...prev,
          [title]: newFilter,
        };
      });
    };

  const handleDeselectAll = () => {
    setLocalFilter((prev: any) => {
      const newFilter = { ...prev[title] };
      Object.keys(mapping).forEach((key) => {
        newFilter[key] = false;
      });
      return {
        ...prev,
        [title]: newFilter,
      };
    });
  };

  return (
    <div className="relative mb-4">
      <div
        className="bg-gray-900 text-white rounded px-4 py-2 mb-2 flex items-center justify-between w-full"
      >
        {displayTag}
      </div>
      <div
        className={`bg-white rounded mt-1 w-full z-10 overflow-hidden transition-all duration-300 ease-in-out`}
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          opacity: 1,
          transform: 'translateY(0)',
          border: 'none'
        }}
      >

        {title=="Categories" ? <div className="p-2">
            <button
              onClick={handleSelectAll}
              className="bg-blue-600 hover:bg-blue-500 text-white rounded px-4 py-2 mr-2"
            >
              全選択
            </button>
            <button
              onClick={handleDeselectAll}
              className="bg-red-600 hover:bg-red-500 text-white rounded px-4 py-2"
            >
              全解除
            </button>
          </div>: null}

        <div className="flex flex-wrap -mx-2 p-2">
          {Object.keys(mapping).map((key: any) => {
            const flag = localFilter[title][key];
            return (
              <div key={key} className={`w-1/${title==="Categories" ? 3 : 2} p-2`}>
                <button 
                  onClick={() => handleChangeFilter(key)} 
                  className={`${flag ? 'bg-blue-900 hover:bg-blue-800' : 'bg-gray-800 hover:bg-gray-700'} text-white rounded px-2 py-2 w-full h-10 overflow-hidden text-sm`}
                >
                  <span className="block truncate">{mapping[key]}</span>
                </button>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

const SelectParameter = (props: any) => {
  const { filter, setFilter } = props;

  const [localFilter, setLocalFilter] = useState<Filter>(filter);
  const [isFreeChecked, setIsFreeChecked] = useState(false);
  const [priceRange, setPriceRange] = useState<number[]>([0, 10000]);

  const handlePriceChange = (values: number[]) => {
    const newFilter = {
      ...localFilter,
      Price: {
        startPrice: values[0],
        endPrice: values[1]
      }
    };
    setPriceRange(values);
    setLocalFilter(newFilter);
  };

  const handleFreeCheckboxChange = () => {
    setIsFreeChecked(!isFreeChecked);
    const newFilter = { ...localFilter };
    newFilter['Price'].startPrice = !isFreeChecked ? 0 : newFilter['Price'].startPrice;
    newFilter['Price'].endPrice = !isFreeChecked ? 0 : newFilter['Price'].endPrice;
    setLocalFilter(newFilter);
  };

  useEffect(() => {
    (async() => {
      const d = await getFilterData('unique_id');
      if(d) {
        setFilter(d);
        setLocalFilter(d);
        setPriceRange([d.Price.startPrice, d.Price.endPrice]);
      }
    })();
  }, [])

  const handleClickFilter = (filter: Filter) => {
    (async() => {
      const d = await getFilterData('unique_id');
      if(d) {
        updateFilterData({
          ...filter,
          id: 'unique_id',
        });

      } else {
        addFilterData({
          ...filter,
          id: 'unique_id',
        });
      }
    })();
    setFilter(filter)
    setLocalFilter(filter)
    if(filter === DEFAULT_FILTER) {
      setPriceRange([0, 10000]);
      setIsFreeChecked(false);
    }
  }

  return (
    <div className="p-4" style={{ maxHeight: '90vh', overflowY: 'auto', paddingBottom: '60px'}}>
      <Dropdown
        displayTag = "カテゴリー"
        title="Categories"
        mapping={genreMapping}
        localFilter={localFilter}
        setLocalFilter={setLocalFilter}
      />
      <div className="relative mb-4">
        <button
          className="bg-gray-900 text-white rounded px-4 py-2 mb-2 flex items-center justify-between w-full"
        >
          価格
        </button>

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
            <SliderFilter
              min={0}
              max={10000}
              values={priceRange}
              onChange={handlePriceChange}
              valueFormatter={(value) => (value === 1 ? '1円' : `${(value)}円`)}
              disabled={isFreeChecked}
            />
          </div>
        </div>
      </div>
      <Dropdown
        displayTag = "モード"
        title="Mode"
        mapping={modeMapping}
        localFilter={localFilter}
        setLocalFilter={setLocalFilter}
      />

      <Dropdown
        displayTag = "対応デバイス"
        title="Device"
        mapping={deviceMapping}
        localFilter={localFilter}
        setLocalFilter={setLocalFilter}
      />
        
      <div className="absolute bottom-0 left-0 p-4 w-[calc(25%-12px)]" style={{ backgroundColor: 'rgba(0, 0, 0, 0.1)', backdropFilter: 'blur(10px)'}}>
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
