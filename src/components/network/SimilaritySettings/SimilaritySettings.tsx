"use client";

import { useEffect, useState } from "react";
import Panel from "../Panel";
import Section from "../Section";
import SettingsIcon from "@mui/icons-material/Settings";
import TuneIcon from "@mui/icons-material/Tune";
import InfoIcon from "@mui/icons-material/Info";

import { changeSliderData, getSliderData } from "@/hooks/indexedDB";
import { SliderSettings } from "@/types/api/FilterType";

type SliderProps = {
  domain: [number, number];
  values: number[];
  onChange: (values: number[]) => void;
  valueFormatter?: (value: number) => string;
};

const Slider: React.FC<SliderProps> = ({
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

  const handleApplySettings = async () => {
    const sliderData: SliderSettings = {
      id: "unique_id",
      genreWeight,
      graphicWeight,
      playstyleWeight,
      reviewWeight,
      isDetailMode,
      subGenreWeight,
      systemWeight,
      visualWeight,
      worldviewWeight,
      difficultyWeight,
      playtimeWeight,
      priceWeight,
      developerWeight,
      deviceWeight,
      releaseDateWeight
    };
    await changeSliderData(sliderData);
    console.log("類似度設定が保存されました。");
  };

  useEffect(() => {
    (async () => {
      const sliderData = await getSliderData();
      if (sliderData) {
        setGenreWeight(sliderData.genreWeight);
        setGraphicWeight(sliderData.graphicWeight);
        setPlaystyleWeight(sliderData.playstyleWeight);
        setReviewWeight(sliderData.reviewWeight);

        setIsDetailMode(sliderData.isDetailMode);

        setSubGenreWeight(sliderData.subGenreWeight);
        setSystemWeight(sliderData.systemWeight);
        setVisualWeight(sliderData.visualWeight);
        setWorldviewWeight(sliderData.worldviewWeight);

        setDifficultyWeight(sliderData.difficultyWeight);
        setPlaytimeWeight(sliderData.playtimeWeight);
        setPriceWeight(sliderData.priceWeight);
        setDeveloperWeight(sliderData.developerWeight);
        setDeviceWeight(sliderData.deviceWeight);
        setReleaseDateWeight(sliderData.releaseDateWeight);
      }
    })();
  }, []);

  return (
    <Panel title="類似度設定" icon={<SettingsIcon className="mr-2 text-white" />}>
      <p className="text-gray-400 mb-4">
        ゲーム間の類似度計算における重みを調整できます。プリセットは4軸で構成されていますが、詳細設定を有効にするとさらに細かい調整が可能です。
      </p>

      <Section title="メイン指標" icon={<TuneIcon />}>
        {!isDetailMode ? (
          <div className="mb-4">
            <label className="text-white block mb-2">ゲームジャンル</label>
            <Slider
              domain={[0,100]}
              values={[genreWeight]}
              onChange={(val) => setGenreWeight(val[0])}
            />
          </div>
        ) : (
          <div className="mb-4">
            <label className="text-white block mb-2">ジャンル</label>
            <Slider
              domain={[0,100]}
              values={[subGenreWeight]}
              onChange={(val) => setSubGenreWeight(val[0])}
            />
            <label className="text-white block mt-4 mb-2">システム</label>
            <Slider
              domain={[0,100]}
              values={[systemWeight]}
              onChange={(val) => setSystemWeight(val[0])}
            />
          </div>
        )}

        {!isDetailMode ? (
          <div className="mb-4">
            <label className="text-white block mb-2">グラフィック</label>
            <Slider
              domain={[0,100]}
              values={[graphicWeight]}
              onChange={(val) => setGraphicWeight(val[0])}
            />
          </div>
        ) : (
          <div className="mb-4">
            <label className="text-white block mb-2">ビジュアル</label>
            <Slider
              domain={[0,100]}
              values={[visualWeight]}
              onChange={(val) => setVisualWeight(val[0])}
            />
            <label className="text-white block mt-4 mb-2">世界観</label>
            <Slider
              domain={[0,100]}
              values={[worldviewWeight]}
              onChange={(val) => setWorldviewWeight(val[0])}
            />
          </div>
        )}

        <div className="mb-4">
          <label className="text-white block mb-2">プレイスタイル</label>
          <Slider
            domain={[0,100]}
            values={[playstyleWeight]}
            onChange={(val) => setPlaystyleWeight(val[0])}
          />
        </div>

        <div className="mb-4">
          <label className="text-white block mb-2">レビュー（評判）</label>
          <Slider
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

      <Section title="詳細設定" icon={<InfoIcon />}>
        <p className="text-gray-400 mb-2 text-sm">
          以下はオプションの細かな調整用要素です。必要に応じて微調整してください。
        </p>
        <div className="mb-4">
          <label className="text-white block mb-2">難易度</label>
          <Slider
            domain={[0,100]}
            values={[difficultyWeight]}
            onChange={(val) => setDifficultyWeight(val[0])}
          />
        </div>
        <div className="mb-4">
          <label className="text-white block mb-2">プレイ時間</label>
          <Slider
            domain={[0,100]}
            values={[playtimeWeight]}
            onChange={(val) => setPlaytimeWeight(val[0])}
          />
        </div>
        <div className="mb-4">
          <label className="text-white block mb-2">金額</label>
          <Slider
            domain={[0,100]}
            values={[priceWeight]}
            onChange={(val) => setPriceWeight(val[0])}
          />
        </div>
        <div className="mb-4">
          <label className="text-white block mb-2">デベロッパー</label>
          <Slider
            domain={[0,100]}
            values={[developerWeight]}
            onChange={(val) => setDeveloperWeight(val[0])}
          />
        </div>
        <div className="mb-4">
          <label className="text-white block mb-2">対応デバイス</label>
          <Slider
            domain={[0,100]}
            values={[deviceWeight]}
            onChange={(val) => setDeviceWeight(val[0])}
          />
        </div>
        <div className="mb-4">
          <label className="text-white block mb-2">リリース日</label>
          <Slider
            domain={[0,100]}
            values={[releaseDateWeight]}
            onChange={(val) => setReleaseDateWeight(val[0])}
          />
        </div>
      </Section>

      <div className="mt-4 space-y-2">
        <button
          className="w-full text-white rounded px-4 py-2 bg-blue-600 hover:bg-blue-500"
          onClick={handleApplySettings}
        >
          類似度設定を適用
        </button>
      </div>
    </Panel>
  );
};

export default SimilaritySettings;
