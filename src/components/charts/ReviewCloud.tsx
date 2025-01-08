'use client';

import { SteamDetailsDataType } from "@/types/api/getSteamDetailType";
import { scaleLog } from "@visx/scale";
import Wordcloud from '@visx/wordcloud/lib/Wordcloud';
import { Text } from '@visx/text';
import { useScreenSize } from "@visx/responsive";

type Props = {
  steamData: SteamDetailsDataType
}

type WordData = {
  text: string;
  value: number;
}

const colors = ['#143059', '#2F6B9A', '#82a6c2'];

// [0,1]で指定される固定値を返すジェネレータ
// この固定値を使用すると毎回同じレイアウトが生成される
const fixedValueGenerator = () => 0.5;


const ReviewCloud = (props:Props) => {

  const { steamData } = props;

  // 画面サイズを取得
  const { width, height } = useScreenSize({ debounceTime: 150 });

  const words = Object.entries(steamData.review).map(([text, value]) => ({
    text,
    value,
  }));

  const fontScale = scaleLog({
    domain: [Math.min(...words.map((w) => w.value)), Math.max(...words.map((w) => w.value))],
    range: [10, 100],
  });
  const fontSizeSetter = (datum: WordData) => fontScale(datum.value);

  if(Object.keys(steamData.review).length === 0) {
    return <div>レビューがありません</div>
  }

  return (
    <div className="select-none ">
      <Wordcloud
        words={words}
        width={width/5}
        height={height/4}
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
              textAnchor={'middle'}
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
  )
}

export default ReviewCloud;