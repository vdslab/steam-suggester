'use client'
import { Suspense, useEffect, useState } from "react";
import { scaleLog } from "@visx/scale";
import Wordcloud from "@visx/wordcloud/lib/Wordcloud";
import { Text } from "@visx/text";
import { useScreenSize } from "@visx/responsive";
import { CircularProgress } from "@mui/material";

// type Props = {
//   reviewData: { [word: string]: number };
// };

type WordData = {
  text: string;
  value: number;
};

const colors = ["#143059", "#2F6B9A", "#82a6c2"];

// 固定値ジェネレータ
const fixedValueGenerator = () => 0.5;

const ReviewCloud = (props: any) => {
  const { reviewData } = props;

  const [words, setWords] = useState<WordData[]>([]);

  // 画面サイズ取得
  const { width, height } = useScreenSize({ debounceTime: 150 });

  // レビューを処理してワードクラウド用データを準備
  useEffect(() => {
    // const filteredData = Object.entries(reviewData).sort((a, b) => b[1] - a[1]).slice(0, 100);
    // const data = filteredData.map(([text, value]) => ({
    //   text,
    //   value,
    // }));
    // setWords(data);
  }, [reviewData]);

  const fontScale = scaleLog({
    domain: [Math.min(...words.map((w) => w.value)), Math.max(...words.map((w) => w.value))],
    range: [10, 100],
  });
  const fontSizeSetter = (datum: WordData) => fontScale(datum.value);

  if (!reviewData || Object.keys(reviewData).length === 0) {
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
          cloudWords.map((w, i) => (
            <Text
              key={w.text}
              fill={colors[i % colors.length]}
              textAnchor={"middle"}
              transform={`translate(${w.x}, ${w.y}) rotate(${w.rotate})`}
              fontSize={w.size}
              fontFamily={w.font}
            >
              {w.text}
            </Text>
          ))
        }
      </Wordcloud>
    </Suspense>
  );
};

export default ReviewCloud;
