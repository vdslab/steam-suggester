"use client";
import { useState, useRef, useEffect } from "react";
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

const priceMapping: any = {
  1: "無料プレイ",
  2: "～1000円",
  3: "～2000円",
  4: "～3000円",
  5: "～4000円",
  6: "～5000円",
  7: "～6000円",
  8: "～7000円",
  9: "～8000円",
  10: "～9000円",
  11: "～10000円"
};

const platformsMapping: any = {
  1: "1人用",
  2: "マルチ用",
};

const deviceMapping: any = {
  1: "windows",
  2: "mac",
};

const playtimeMapping: any = {
  1: "～100時間",
  2: "～200時間",
  3: "～300時間",
  4: "～400時間",
  5: "～500時間",
  6: "～600時間",
  7: "～700時間",
  8: "～800時間",
  9: "～900時間",
  10: "～1000時間",
};

const SliderFilter = ({ min, max, values, onChange, valueFormatter, disabled }: { min: number, max: number, values: number[], onChange: (values: number[]) => void, valueFormatter: (value: number) => string, disabled: boolean }) => {
  const [domain] = useState([min, max]);

  const handleChange = (newValues: number[]) => {
    onChange(newValues);
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

const Dropdown = ({ displayTag, title, mapping, isVisible, toggleVisibility, localFilter, setLocalFilter }: { displayTag:string, title: string, mapping: any, isVisible: boolean, toggleVisibility: () => void, localFilter: any, setLocalFilter: any }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const w = title === "Categories" ? 3 : 2;

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

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.maxHeight = isVisible
        ? `${contentRef.current.scrollHeight}px`
        : '0px';
    }
  }, [isVisible]);

  return (
    <div className="relative mb-4">
      <button
        className="bg-gray-900 hover:bg-gray-800 text-white rounded px-4 py-2 mb-2 flex items-center justify-between w-full"
        onClick={toggleVisibility}
      >
        {displayTag}
        <span className="ml-2">{isVisible ? '▲' : '▼'}</span>
      </button>
      <div
        ref={contentRef}
        className={`bg-white rounded mt-1 w-full z-10 overflow-hidden transition-all duration-300 ease-in-out`}
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          maxHeight: isVisible ? `${contentRef.current?.scrollHeight}px` : '0px',
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(-20px)',
          border: 'none'
        }}
      >

      <div className="flex flex-wrap -mx-2 p-2">
        {Object.keys(mapping).map((key: any) => {
          const flag = localFilter[title][key];
          return (
            <div key={key} className="w-1/2 p-2">
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
        {/* <div className="flex flex-wrap -mx-2 p-2">
          {Object.keys(mapping).map((key: any) => {
            const flag = localFilter[title][key];
            return <div key={key} className={`w-1/${w} p-2`}>
              {flag ? <button onClick={() => handleChangeFilter(key)} className="bg-blue-900 hover:bg-blue-800 text-white rounded px-4 py-2 w-full h-12 overflow-hidden text-lg">
                <span className="block truncate">{mapping[key]}</span>
              </button> : <button onClick={() => handleChangeFilter(key)} className="bg-gray-800 hover:bg-gray-700 text-white rounded px-4 py-2 w-full h-12 overflow-hidden text-lg">
                <span className="block truncate">{mapping[key]}</span>
              </button>}
            </div>
          })}
        </div> */}
      </div>
    </div>
  );
};

const SelectParameter = (props: any) => {
  const [visibleDropdown, setVisibleDropdown] = useState<string | null>(null);
  const { filter, setFilter } = props;
  console.log(filter);

  const [localFilter, setLocalFilter] = useState(filter);
  const [isFreeChecked, setIsFreeChecked] = useState(false);
  const [priceRange, setPriceRange] = useState<number[]>([0, 11]);
  const [playtimeRange, setPlaytimeRange] = useState<number[]>([0, 10]);

  const toggleDropdown = (dropdown: string) => {
    setVisibleDropdown(prev => (prev === dropdown ? null : dropdown));
  };

  const handlePriceChange = (values: number[]) => {
    setPriceRange(values);
    const newFilter = { ...localFilter };
    for (let key in priceMapping) {
      const priceLevel = parseInt(key);
      if (priceLevel >= values[0] + 1 && priceLevel <= values[1]) {
        newFilter['Price'][key] = true;
      } else {
        newFilter['Price'][key] = false;
      }
    }
    setLocalFilter(newFilter);
  };

  const handleFreeCheckboxChange = () => {
    setIsFreeChecked(!isFreeChecked);
    const newFilter = { ...localFilter };
    newFilter['Price'][0] = !isFreeChecked;
    for (let i = 1; i <= 11; i++) {
      newFilter['Price'][i] = false;
    }
    setLocalFilter(newFilter);
  };

  const handlePlaytimeChange = (values: number[]) => {
    setPlaytimeRange(values);
    const newFilter = { ...localFilter };
    for (let key in playtimeMapping) {
      const playtimeLevel = parseInt(key);
      if (playtimeLevel >= values[0] + 1 && playtimeLevel <= values[1]) {
        newFilter['Playtime'][key] = true;
      } else {
        newFilter['Playtime'][key] = false;
      }
    }
    setLocalFilter(newFilter);
  };


  return (
    <div className="p-4" style={{ maxHeight: '90vh', overflowY: 'auto'}}>
      <div className="flex justify-end mb-4">
        <button
          className="bg-blue-600 hover:bg-blue-500 text-white rounded px-4 py-2"
          onClick={() => setFilter(localFilter)}
        >
          フィルターを適用
        </button>
      </div>
      <Dropdown
        displayTag = "カテゴリー"
        title="Categories"
        mapping={genreMapping}
        isVisible={visibleDropdown === "Categories"}
        toggleVisibility={() => toggleDropdown("Categories")}
        localFilter={localFilter}
        setLocalFilter={setLocalFilter}
      />
      <div className="relative mb-4">
        <button
          className="bg-gray-900 hover:bg-gray-800 text-white rounded px-4 py-2 mb-2 flex items-center justify-between w-full"
          onClick={() => toggleDropdown("Price")}
        >
          価格
          <span className="ml-2">{visibleDropdown === 'Price' ? '▲' : '▼'}</span>
        </button>
        {visibleDropdown === 'Price' && (
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
                min={1}
                max={11}
                values={priceRange}
                onChange={handlePriceChange}
                valueFormatter={(value) => (value === 1 ? '1円' : `${(value-1) * 1000}円`)}
                disabled={isFreeChecked}
              />
            </div>
          </div>
        )}
      </div>
      {/* <Dropdown
        title="Price"
        mapping={priceMapping}
        isVisible={visibleDropdown === "Price"}
        toggleVisibility={() => toggleDropdown("Price")}
        localFilter={localFilter}
        setLocalFilter={setLocalFilter}
      /> */}
      <Dropdown
        displayTag = "プラットフォーム"
        title="Platforms"
        mapping={platformsMapping}
        isVisible={visibleDropdown === "Platforms"}
        toggleVisibility={() => toggleDropdown("Platforms")}
        localFilter={localFilter}
        setLocalFilter={setLocalFilter}
      />

      <Dropdown
        displayTag = "対応デバイス"
        title="device"
        mapping={deviceMapping}
        isVisible={visibleDropdown === "device"}
        toggleVisibility={() => toggleDropdown("device")}
        localFilter={localFilter}
        setLocalFilter={setLocalFilter}
      />
      {/* <div className="relative mb-4">
        <button
          className="bg-gray-900 hover:bg-gray-800 text-white rounded px-4 py-2 mb-2 flex items-center justify-between w-full"
          onClick={() => toggleDropdown("Playtime")}
        >
          プレイ時間
          <span className="ml-2">{visibleDropdown === 'Playtime' ? '▲' : '▼'}</span>
        </button>
        {visibleDropdown === 'Playtime' && (
          <div className="rounded mt-1 w-full z-10 overflow-hidden">
            <div className="p-4 text-white">
              <SliderFilter
                min={0}
                max={10}
                values={playtimeRange}
                onChange={handlePlaytimeChange}
                valueFormatter={(value) => `${(value) * 100}時間`}
                disabled={false}
              />
            </div>
          </div>
        )}
      </div> */}
      {/* <Dropdown
        displayTag = "プレイ時間"
        title="Playtime"
        mapping={playtimeMapping}
        isVisible={visibleDropdown === "Playtime"}
        toggleVisibility={() => toggleDropdown("Playtime")}
        localFilter={localFilter}
        setLocalFilter={setLocalFilter}
      /> */}
    </div>
  );
};

export default SelectParameter;
