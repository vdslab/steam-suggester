// components/GameEasySearchPanel.tsx
"use client";

import React, { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { Filter } from "@/types/api/FilterType";
import { changeFilterData } from "@/hooks/indexedDB";
import { DEFAULT_FILTER } from "@/constants/DEFAULT_FILTER";
import HelpTooltip from "./HelpTooltip";

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
  const [errorMessage, setErrorMessage] = useState<string>("");

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
    // バリデーション: 少なくとも1つのジャンルが選択されているか確認
    if (selectedGenres.length === 0) {
      setErrorMessage("少なくとも1つのゲームジャンルを選択してください。");
      return;
    }

    // エラーメッセージをクリア
    setErrorMessage("");

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30 transition-opacity duration-300">
      <div className="bg-gray-800 rounded-lg w-11/12 md:w-3/4 lg:w-1/2 p-6 relative transform transition-transform duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-400"
          aria-label="閉じる"
        >
          <CloseIcon />
        </button>
        <h2 className="text-2xl mb-6 text-white text-center">
          ゲームを簡単に探す
        </h2>

        {/* エラーメッセージの表示 */}
        {errorMessage && (
          <div className="mb-4 text-red-500 text-center">{errorMessage}</div>
        )}

        {/* 1. ゲームジャンルの選択 */}
        <div className="mb-6">
          <h3 className="text-lg mb-2 text-white">
            1. 気になるゲームジャンルを選んでください。
            <span className="text-red-500 ml-1">*</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {GENRE_OPTIONS.map((genre) => (
              <button
                key={genre}
                onClick={() => handleGenreChange(genre)}
                aria-pressed={selectedGenres.includes(genre)}
                className={`px-4 py-2 rounded-full border flex items-center justify-center transition-colors duration-300 ${
                  selectedGenres.includes(genre)
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-gray-700 text-white border-gray-700 hover:bg-gray-600"
                }`}
              >
                {genre}
                {selectedGenres.includes(genre) && (
                  <span className="ml-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414L8.414 15 4.293 10.879a1 1 0 011.414-1.414L8.414 12.172l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 2. ゲーム価格の予算 */}
        <div className="mb-6">
          <h3 className="text-lg mb-2 text-white">
            2. ゲームの予算はいくらですか？
          </h3>
          <div className="flex flex-wrap gap-2">
            {PRICE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handlePriceChange(option.value)}
                aria-pressed={selectedPrice === option.value}
                className={`px-4 py-2 rounded-full border flex items-center justify-center transition-colors duration-300 ${
                  selectedPrice === option.value
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-gray-700 text-white border-gray-700 hover:bg-gray-600"
                }`}
              >
                {option.label}
                {selectedPrice === option.value && (
                  <span className="ml-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414L8.414 15 4.293 10.879a1 1 0 011.414-1.414L8.414 12.172l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 3. その他の希望 */}
        <div className="mb-6">
          <h3 className="text-lg mb-2 text-white">
            3. その他に希望はありますか？(要らないけどテスト用)
          </h3>
          <div className="flex flex-wrap gap-2">
            {PREFERENCE_OPTIONS.map((pref) => (
              <button
                key={pref.value}
                onClick={() => handlePreferenceChange(pref.value)}
                aria-pressed={selectedPreferences.includes(pref.value)}
                className={`px-4 py-2 rounded-full border flex items-center justify-center transition-colors duration-300 ${
                  selectedPreferences.includes(pref.value)
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-gray-700 text-white border-gray-700 hover:bg-gray-600"
                }`}
              >
                {pref.label}
                {selectedPreferences.includes(pref.value) && (
                  <span className="ml-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414L8.414 15 4.293 10.879a1 1 0 011.414-1.414L8.414 12.172l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Steam連携 */}
        <div className="mb-6">
          <h3 className="text-lg mb-2 text-white">
            4. Steam連携
            <HelpTooltip title="Steamアカウントにログインすると、所持ゲームや友達リストを活用して、よりパーソナライズされたゲーム検索が可能になります。" />
          </h3>
          <div className="flex flex-col items-center">
            <button
              onClick={() => {
                // TODO:
                alert("test");
              }}
              className="flex items-center bg-steam-blue hover:bg-steam-dark-blue text-white px-6 py-3 rounded-md shadow-md transition-colors duration-300"
            >
              {/* Steamアイコンの追加（SVG） */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-2"
                viewBox="0 0 448 512"
                fill="currentColor"
              >
                {/* FontAwesomeのSteamアイコンを使用 */}
                <path d="M424.1 0H23.9C10.7 0 0 10.7 0 23.9V488c0 13.2 10.7 23.9 23.9 23.9H424c13.2 0 23.9-10.7 23.9-23.9V23.9C448 10.7 437.3 0 424.1 0zM96.4 396c-5.3 0-10.4-2.3-14.4-6.4L24 271.1c-4-4-6.4-9.1-6.4-14.4s2.3-10.4 6.4-14.4l58.1-58.1c4-4 9.1-6.4 14.4-6.4s10.4 2.3 14.4 6.4l58.1 58.1c4 4 6.4 9.1 6.4 14.4s-2.3 10.4-6.4 14.4l-58.1 58.1c-4 4-9.1 6.4-14.4 6.4zM352 340c-5.3 0-10.4-2.3-14.4-6.4l-58.1-58.1c-4-4-6.4-9.1-6.4-14.4s2.3-10.4 6.4-14.4l58.1-58.1c4-4 9.1-6.4 14.4-6.4s10.4 2.3 14.4 6.4l58.1 58.1c4 4 6.4 9.1 6.4 14.4s-2.3 10.4-6.4 14.4l-58.1 58.1c-4 4-9.1 6.4-14.4 6.4z" />
              </svg>
              Steamと連携する
            </button>
          </div>
        </div>

        {/* 検索ボタン */}
        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={selectedGenres.length === 0}
            className={`${
              selectedGenres.length === 0
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-500"
            } text-white px-6 py-3 rounded-md shadow-md transition-colors duration-300`}
          >
            検索
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameEasySearchPanel;
