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
  score: number;
};

export const getColorByScore = (score: number) => {
  const blue = "#4a90e2";
  const red = "#d14b56";
  const ratio = (score + 1) / 2;

  const interpolate = (start: number, end: number) =>
    Math.round(start + ratio * (end - start))
      .toString(16)
      .padStart(2, "0");

  return `#${interpolate(209, 74)}${interpolate(75, 144)}${interpolate(86, 226)}`;
};

// 固定値ジェネレータ
const fixedValueGenerator = () => 0.5;
const MAX_REVIEW_WORDS = 40;

const ReviewCloud = ({ reviewData }: Props) => {
  const [words, setWords] = useState<WordData[]>([]);
  const [isLoading, setIsLoading] = useState(true); // ローディング状態
  const { width, height } = useScreenSize({ debounceTime: 150 });

  // 1秒のローディングを挟む
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      const filteredData = reviewData
        .sort((a, b) => b.tfidf - a.tfidf)
        .slice(0, MAX_REVIEW_WORDS)
        .map((item) => ({
          text: item.name,
          value: item.tfidf,
          score: item.score,
        }));

      setWords(filteredData);
      setIsLoading(false);
    }, 1300);

    return () => clearTimeout(timer);
  }, [reviewData]);

  const fontScale = scaleLog({
    domain: words.length ? [Math.min(...words.map((w) => w.value)), Math.max(...words.map((w) => w.value))] : [1, 100],
    range: [10, 100],
  });

  const fontSizeSetter = (datum: WordData) => fontScale(datum.value);

  if (!reviewData || reviewData.length === 0) {
    return <div className="text-white">レビューがありません</div>;
  }

  const cloudWidth = width / 5;
  const cloudHeight = height / 4;

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {isLoading ? (
        <div
          style={{
            width: cloudWidth,
            height: cloudHeight,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress />
        </div>
      ) : (
        <Wordcloud
          words={words}
          width={cloudWidth}
          height={cloudHeight}
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
                  textAnchor="middle"
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
      )}
    </div>
  );
};

export default ReviewCloud;
