'use client'
import { useEffect, useState } from "react";
import { SteamDetailsDataType } from "@/types/api/getSteamDetailType";
import { scaleLog } from "@visx/scale";
import Wordcloud from "@visx/wordcloud/lib/Wordcloud";
import { Text } from "@visx/text";
import { useScreenSize } from "@visx/responsive";

type Props = {
  steamData: SteamDetailsDataType;
};

type WordData = {
  text: string;
  value: number;
};

const colors = ["#143059", "#2F6B9A", "#82a6c2"];

// 固定値ジェネレータ
const fixedValueGenerator = () => 0.5;

const ReviewCloud = (props: Props) => {
  const { steamData } = props;

  // ローディング状態の管理
  const [isLoading, setIsLoading] = useState(true);
  const [words, setWords] = useState<WordData[]>([]);

  // 画面サイズ取得
  const { width, height } = useScreenSize({ debounceTime: 150 });

  // レビューを処理してワードクラウド用データを準備
  useEffect(() => {
    if (!steamData || Object.keys(steamData.review).length === 0) {
      setIsLoading(false); // レビューがない場合もローディング終了
      return;
    }

    // 非同期処理で遅延を模倣
    setIsLoading(true);
    const loadWords = async () => {
      const data = Object.entries(steamData.review).map(([text, value]) => ({
        text,
        value,
      }));
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 1秒遅延
      setWords(data);
      setIsLoading(false);
    };

    loadWords();
  }, [steamData]);

  const fontScale = scaleLog({
    domain: [Math.min(...words.map((w) => w.value)), Math.max(...words.map((w) => w.value))],
    range: [10, 100],
  });
  const fontSizeSetter = (datum: WordData) => fontScale(datum.value);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-white animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        <p className="text-white ml-4">ワードクラウドを生成中...</p>
      </div>
    );
  }

  if (words.length === 0) {
    return <div className="text-white">レビューがありません</div>;
  }

  return (
    <div className="select-none">
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
    </div>
  );
};

export default ReviewCloud;
