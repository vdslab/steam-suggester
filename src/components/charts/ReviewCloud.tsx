"use client";
import { Suspense, useEffect, useState } from "react";
import { scaleLog } from "@visx/scale";
import Wordcloud from "@visx/wordcloud/lib/Wordcloud";
import { Text } from "@visx/text";
import { useScreenSize } from "@visx/responsive";
import { CircularProgress } from "@mui/material";
import d3Cloud from "d3-cloud";

type Props = {
  reviewData: {
    name: string;
    score: number;
    tfidf: number;
  }[];
};

type WordData = {
  text: string;
  value: number;
  score: number; // スコアを追加
};

export const getColorByScore = (score: number) => {
  // スコアが1のときに青、-1のときに赤になるように補完
  const blue = "#4a90e2";
  const red = "#d14b56";

  // スコアが-1から1の範囲で補完
  const ratio = (score + 1) / 2; // -1 -> 0, 1 -> 1 の範囲に変換

  // RGBで補完するため、赤と青のRGB値を取得
  const redRGB = parseInt(red.slice(1, 3), 16);
  const greenRGB = parseInt(red.slice(3, 5), 16);
  const blueRGB = parseInt(red.slice(5, 7), 16);

  const blueRGBNew = parseInt(blue.slice(1, 3), 16);
  const greenRGBNew = parseInt(blue.slice(3, 5), 16);
  const blueRGBNew2 = parseInt(blue.slice(5, 7), 16);

  // 赤と青の間で線形補完
  const r = Math.round(redRGB + ratio * (blueRGBNew - redRGB))
    .toString(16)
    .padStart(2, "0");
  const g = Math.round(greenRGB + ratio * (greenRGBNew - greenRGB))
    .toString(16)
    .padStart(2, "0");
  const b = Math.round(blueRGB + ratio * (blueRGBNew2 - blueRGB))
    .toString(16)
    .padStart(2, "0");

  // 変換したRGB値を使って色を作成
  return `#${r}${g}${b}`;
};

// 固定値ジェネレータ
const fixedValueGenerator = () => 0.5;
const MAX_REVIEW_WORDS = 70;

const ReviewCloud = (props: Props) => {
  const { reviewData } = props;

  const [words, setWords] = useState<WordData[]>([]);

  // 画面サイズ取得
  const { width, height } = useScreenSize({ debounceTime: 150 });

  // レビューを処理してワードクラウド用データを準備
  useEffect(() => {
    const filteredData = reviewData
      .sort((a, b) => b.tfidf - a.tfidf) // TF-IDF の降順でソート
      .slice(0, MAX_REVIEW_WORDS);

    const data = filteredData.map((item) => ({
      text: item.name,
      value: item.tfidf,
      score: item.score,
    }));
    setWords(data);
  }, [reviewData]);

  const fontScale = scaleLog({
    domain: [
      Math.min(...words.map((w) => w.value)),
      Math.max(...words.map((w) => w.value)),
    ],
    range: [10, 100],
  });

  const fontSizeSetter = (datum: WordData) => fontScale(datum.value);

  if (!reviewData || reviewData.length === 0) {
    return <div className="text-white">レビューがありません</div>;
  }

  return (
    <Suspense fallback={<CircularProgress />}>
      <Wordcloud
        words={words}
        width={width / 5}
        height={height / 4}
        fontSize={fontSizeSetter}
        padding={2}
        rotate={0}
        random={fixedValueGenerator}
      >
        {(cloudWords) =>
          cloudWords.map((w: d3Cloud.Word) => {
            const wordData = words.find((word) => word.text === w.text);
            return (
              <Text
                key={w.text}
                fill={wordData ? getColorByScore(wordData.score) : "gray"}
                textAnchor={"middle"}
                transform={`translate(${w.x}, ${w.y}) rotate(${w.rotate})`}
                fontSize={w.size}
                fontFamily={w.font}
                style={{ userSelect: "none" }}
              >
                {w.text}
              </Text>
            );
          })
        }
      </Wordcloud>
    </Suspense>
  );
};

export default ReviewCloud;
