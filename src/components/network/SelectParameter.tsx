"use client";
import { useState, useRef, useEffect } from "react";

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

const Dropdown = ({ title, mapping, isVisible, toggleVisibility, localFilter, setLocalFilter }: { title: string, mapping: any, isVisible: boolean, toggleVisibility: () => void, localFilter: any, setLocalFilter: any }) => {
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
        {title}
        <span className="ml-2">{isVisible ? '▲' : '▼'}</span>
      </button>
      <div
        ref={contentRef}
        className={`absolute bg-white rounded mt-1 w-full z-10 overflow-hidden transition-all duration-300 ease-in-out`}
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
            return <div key={key} className={`w-1/${w} p-2`}>
              {flag ? <button onClick={() => handleChangeFilter(key)} className="bg-blue-900 hover:bg-blue-800 text-white rounded px-4 py-2 w-full h-12 overflow-hidden text-lg">
                <span className="block truncate">{mapping[key]}</span>
              </button> : <button onClick={() => handleChangeFilter(key)} className="bg-gray-800 hover:bg-gray-700 text-white rounded px-4 py-2 w-full h-12 overflow-hidden text-lg">
                <span className="block truncate">{mapping[key]}</span>
              </button>}
            </div>
          })}
        </div>
      </div>
    </div>
  );
};

const SelectParameter = (props: any) => {
  const [visibleDropdown, setVisibleDropdown] = useState<string | null>(null);
  const { filter, setFilter } = props;

  const [localFilter, setLocalFilter] = useState(filter);

  const toggleDropdown = (dropdown: string) => {
    setVisibleDropdown(prev => (prev === dropdown ? null : dropdown));
  };

  return (
    <div className="p-4">
      <div className="flex justify-end mb-4">
        <button
          className="bg-blue-600 hover:bg-blue-500 text-white rounded px-4 py-2"
          onClick={() => setFilter(localFilter)}
        >
          Regenerate
        </button>
      </div>
      <Dropdown
        title="Categories"
        mapping={genreMapping}
        isVisible={visibleDropdown === "Categories"}
        toggleVisibility={() => toggleDropdown("Categories")}
        localFilter={localFilter}
        setLocalFilter={setLocalFilter}
      />
      <Dropdown
        title="Price"
        mapping={priceMapping}
        isVisible={visibleDropdown === "Price"}
        toggleVisibility={() => toggleDropdown("Price")}
        localFilter={localFilter}
        setLocalFilter={setLocalFilter}
      />
      <Dropdown
        title="Platforms"
        mapping={platformsMapping}
        isVisible={visibleDropdown === "Platforms"}
        toggleVisibility={() => toggleDropdown("Platforms")}
        localFilter={localFilter}
        setLocalFilter={setLocalFilter}
      />
      <Dropdown
        title="Playtime"
        mapping={playtimeMapping}
        isVisible={visibleDropdown === "Playtime"}
        toggleVisibility={() => toggleDropdown("Playtime")}
        localFilter={localFilter}
        setLocalFilter={setLocalFilter}
      />
    </div>
  );
};

export default SelectParameter;
