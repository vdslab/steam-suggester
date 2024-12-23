// components/GameEasySearchPanel.tsx
"use client";

import React, { useState } from "react";
import Panel from "./Panel";
import CloseIcon from "@mui/icons-material/Close";
import { Filter } from "@/types/api/FilterType";
import { changeFilterData } from "@/hooks/indexedDB";
import { DEFAULT_FILTER } from "@/constants/DEFAULT_FILTER";

type Props = {
  filter: Filter;
  setFilter: React.Dispatch<React.SetStateAction<Filter>>;
  setIsNetworkLoading: React.Dispatch<React.SetStateAction<boolean>>;
  onClose: () => void;
};

const GENRE_OPTIONS = [
  "アクション",
  "アドベンチャー",
  "RPG",
  "シューティング",
  "シミュレーション",
  // 必要に応じて追加
];

const PRICE_OPTIONS = [
  { label: "無料", value: "free" },
  { label: "1~1000円", value: "1-1000" },
  { label: "1001円~", value: "1001-" },
];

const PREFERENCE_OPTIONS = [
  { label: "シングルプレイヤー", value: "single" },
  { label: "マルチプレイヤー", value: "multi" },
  { label: "Windows対応", value: "windows" },
  { label: "Mac対応", value: "mac" },
];

const GameEasySearchPanel: React.FC<Props> = ({
  filter,
  setFilter,
  setIsNetworkLoading,
  onClose,
}) => {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedPrice, setSelectedPrice] = useState<string>("free");
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);

  const handleGenreChange = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handlePriceChange = (price: string) => {
    setSelectedPrice(price);
  };

  const handlePreferenceChange = (preference: string) => {
    setSelectedPreferences((prev) =>
      prev.includes(preference)
        ? prev.filter((p) => p !== preference)
        : [...prev, preference]
    );
  };

  const handleSubmit = async () => {
    // フィルターの設定
    const newFilter: Filter = {
      ...DEFAULT_FILTER,
    };

    // IndexedDBにフィルターを保存
    await changeFilterData(newFilter);

    // フィルターを状態に設定
    setFilter(newFilter);

    // ネットワークの再読み込みをトリガー
    setIsNetworkLoading(true);

    // ポップアップを閉じる
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30">
      <div className="bg-gray-800 rounded-lg w-11/12 md:w-3/4 lg:w-1/2 p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-400"
        >
          <CloseIcon />
        </button>
        <h2 className="text-2xl mb-4 text-white">ゲームを簡単に探す</h2>

        {/* 1. ゲームジャンルの選択 */}
        <div className="mb-6">
          <h3 className="text-lg mb-2 text-white">
            1. 探したいゲームジャンルを選んでください。
          </h3>
          <div className="flex flex-wrap">
            {GENRE_OPTIONS.map((genre) => (
              <label
                key={genre}
                className="mr-4 mb-2 flex items-center text-white"
              >
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-blue-600"
                  checked={selectedGenres.includes(genre)}
                  onChange={() => handleGenreChange(genre)}
                />
                <span className="ml-2">{genre}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 2. ゲーム価格の予算 */}
        <div className="mb-6">
          <h3 className="text-lg mb-2 text-white">
            2. ゲーム価格の予算はいくらですか？
          </h3>
          <div className="flex flex-col">
            {PRICE_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="mr-4 mb-2 flex items-center text-white"
              >
                <input
                  type="radio"
                  name="price"
                  className="form-radio h-5 w-5 text-blue-600"
                  value={option.value}
                  checked={selectedPrice === option.value}
                  onChange={() => handlePriceChange(option.value)}
                />
                <span className="ml-2">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 3. その他の希望 */}
        <div className="mb-6">
          <h3 className="text-lg mb-2 text-white">
            3. その他に希望はありますか？
          </h3>
          <div className="flex flex-wrap">
            {PREFERENCE_OPTIONS.map((pref) => (
              <label
                key={pref.value}
                className="mr-4 mb-2 flex items-center text-white"
              >
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-blue-600"
                  checked={selectedPreferences.includes(pref.value)}
                  onChange={() => handlePreferenceChange(pref.value)}
                />
                <span className="ml-2">{pref.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 検索ボタン */}
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            検索
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameEasySearchPanel;
