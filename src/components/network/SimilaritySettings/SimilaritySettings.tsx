"use client";

import { useState } from "react";
import Panel from "../Panel";          // パネルコンポーネント（UI例）
import Section from "../Section";      // セクション見出しコンポーネント（UI例）
import SettingsIcon from "@mui/icons-material/Settings";
import TuneIcon from "@mui/icons-material/Tune";
import InfoIcon from "@mui/icons-material/Info";
import CategoryIcon from "@mui/icons-material/Category";
import VisibilityIcon from "@mui/icons-material/Visibility";
import GroupIcon from "@mui/icons-material/Group";
import StarIcon from "@mui/icons-material/Star";

type FilterSliderProps = {
  domain: [number, number];
  values: number[];
  onChange: (values: number[]) => void;
  valueFormatter?: (value: number) => string;
};

const FilterSlider: React.FC<FilterSliderProps> = ({
  domain,
  values,
  onChange,
  valueFormatter
}) => {
  const [min, max] = domain;
  const currentValue = values[0];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = parseFloat(e.target.value);
    onChange([newVal]);
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-white text-sm">
        {valueFormatter ? valueFormatter(currentValue) : currentValue}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={currentValue}
        onChange={handleChange}
        className="flex-1"
      />
    </div>
  );
};

const SimilaritySettings = () => {
  const [genreWeight, setGenreWeight] = useState<number>(50);
  const [graphicWeight, setGraphicWeight] = useState<number>(50);
  const [playstyleWeight, setPlaystyleWeight] = useState<number>(50);
  const [reviewWeight, setReviewWeight] = useState<number>(50);

  const [isDetailMode, setIsDetailMode] = useState<boolean>(false);

  const [subGenreWeight, setSubGenreWeight] = useState<number>(genreWeight / 2);
  const [systemWeight, setSystemWeight] = useState<number>(genreWeight / 2);
  const [visualWeight, setVisualWeight] = useState<number>(graphicWeight / 2);
  const [worldviewWeight, setWorldviewWeight] = useState<number>(graphicWeight / 2);

  const [difficultyWeight, setDifficultyWeight] = useState<number>(0);
  const [playtimeWeight, setPlaytimeWeight] = useState<number>(0);
  const [priceWeight, setPriceWeight] = useState<number>(0);
  const [developerWeight, setDeveloperWeight] = useState<number>(0);
  const [deviceWeight, setDeviceWeight] = useState<number>(0);
  const [releaseDateWeight, setReleaseDateWeight] = useState<number>(0);

  const handleDetailModeToggle = () => {
    setIsDetailMode(!isDetailMode);
  };

  return (
    <Panel title="類似度設定" icon={<SettingsIcon className="mr-2 text-white" />}>
      <p className="text-gray-400 mb-4">
        ゲーム間の類似度計算における重みを調整できます。プリセットは4軸で構成されていますが、詳細設定を有効にするとさらに細かい調整が可能です。
      </p>

      {/* メインスライダー群 */}
      <Section title="メイン指標" icon={<TuneIcon />}>
        {/* ジャンル（統合） */}
        {!isDetailMode ? (
          <div className="mb-4">
            <label className="text-white block mb-2">ゲームジャンル</label>
            <FilterSlider
              domain={[0,100]}
              values={[genreWeight]}
              onChange={(val) => setGenreWeight(val[0])}
            />
          </div>
        ) : (
          <div className="mb-4">
            <label className="text-white block mb-2">ジャンル</label>
            <FilterSlider
              domain={[0,100]}
              values={[subGenreWeight]}
              onChange={(val) => setSubGenreWeight(val[0])}
            />
            <label className="text-white block mt-4 mb-2">システム</label>
            <FilterSlider
              domain={[0,100]}
              values={[systemWeight]}
              onChange={(val) => setSystemWeight(val[0])}
            />
          </div>
        )}

        {/* グラフィック（統合） */}
        {!isDetailMode ? (
          <div className="mb-4">
            <label className="text-white block mb-2">グラフィック</label>
            <FilterSlider
              domain={[0,100]}
              values={[graphicWeight]}
              onChange={(val) => setGraphicWeight(val[0])}
            />
          </div>
        ) : (
          <div className="mb-4">
            <label className="text-white block mb-2">ビジュアル</label>
            <FilterSlider
              domain={[0,100]}
              values={[visualWeight]}
              onChange={(val) => setVisualWeight(val[0])}
            />
            <label className="text-white block mt-4 mb-2">世界観</label>
            <FilterSlider
              domain={[0,100]}
              values={[worldviewWeight]}
              onChange={(val) => setWorldviewWeight(val[0])}
            />
          </div>
        )}

        {/* プレイスタイル */}
        <div className="mb-4">
          <label className="text-white block mb-2">プレイスタイル</label>
          <FilterSlider
            domain={[0,100]}
            values={[playstyleWeight]}
            onChange={(val) => setPlaystyleWeight(val[0])}
          />
        </div>

        {/* レビュー */}
        <div className="mb-4">
          <label className="text-white block mb-2">レビュー（評判）</label>
          <FilterSlider
            domain={[0,100]}
            values={[reviewWeight]}
            onChange={(val) => setReviewWeight(val[0])}
          />
        </div>

        <div className="mb-4 flex items-center">
          <input
            type="checkbox"
            className="form-checkbox h-5 w-5 text-gray-600"
            checked={isDetailMode}
            onChange={handleDetailModeToggle}
          />
          <span className="ml-2 text-white">詳細モードを有効にする</span>
        </div>
      </Section>

      {/* 詳細調整要素 */}
      <Section title="詳細設定" icon={<InfoIcon />}>
        <p className="text-gray-400 mb-2 text-sm">
          以下はオプションの細かな調整用要素です。必要に応じて微調整してください。
        </p>
        <div className="mb-4">
          <label className="text-white block mb-2">難易度</label>
          <FilterSlider
            domain={[0,100]}
            values={[difficultyWeight]}
            onChange={(val) => setDifficultyWeight(val[0])}
          />
        </div>
        <div className="mb-4">
          <label className="text-white block mb-2">プレイ時間</label>
          <FilterSlider
            domain={[0,100]}
            values={[playtimeWeight]}
            onChange={(val) => setPlaytimeWeight(val[0])}
          />
        </div>
        <div className="mb-4">
          <label className="text-white block mb-2">金額</label>
          <FilterSlider
            domain={[0,100]}
            values={[priceWeight]}
            onChange={(val) => setPriceWeight(val[0])}
          />
        </div>
        <div className="mb-4">
          <label className="text-white block mb-2">デベロッパー</label>
          <FilterSlider
            domain={[0,100]}
            values={[developerWeight]}
            onChange={(val) => setDeveloperWeight(val[0])}
          />
        </div>
        <div className="mb-4">
          <label className="text-white block mb-2">対応デバイス</label>
          <FilterSlider
            domain={[0,100]}
            values={[deviceWeight]}
            onChange={(val) => setDeviceWeight(val[0])}
          />
        </div>
        <div className="mb-4">
          <label className="text-white block mb-2">リリース日</label>
          <FilterSlider
            domain={[0,100]}
            values={[releaseDateWeight]}
            onChange={(val) => setReleaseDateWeight(val[0])}
          />
        </div>
      </Section>

      <div className="mt-4 space-y-2">
        <button
          className="w-full text-white rounded px-4 py-2 bg-blue-600 hover:bg-blue-500"
          // 実際はこの時点で計算結果を適用する処理を実装
          onClick={() => console.log("類似度計算適用")}
        >
          類似度設定を適用
        </button>
      </div>
    </Panel>
  );
};

export default SimilaritySettings;

