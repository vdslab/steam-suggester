"use client";
import React, { useEffect, useState, useMemo } from "react";
import d3Cloud from "d3-cloud";
import { scaleLinear, scaleSequential } from "d3-scale";
import { interpolateCool } from "d3-scale-chromatic";

type Props = {
  tagData: {
    text: string;
    value: number;
  }[];
  popupWidth: number;
  popupHeight: number;
};

type WordData = {
  text: string;
  value: number;
  x?: number;
  y?: number;
  rotate?: number;
  size?: number;
  color?: string;
};

const MAX_TAGS = 30;

const TagCloud: React.FC<Props> = React.memo(
  ({ tagData, popupWidth, popupHeight }) => {
    const [cloudWords, setCloudWords] = useState<WordData[]>([]);

    // TagCloudのレイアウト計算をメモ化
    const computedTagData = useMemo(() => {
      if (!tagData || tagData.length === 0) {
        return [];
      }

      const filteredData = tagData
        .sort((a, b) => b.value - a.value)
        .slice(0, MAX_TAGS);

      const minValue = Math.min(...filteredData.map((tag) => tag.value));
      const maxValue = Math.max(...filteredData.map((tag) => tag.value));

      const fontScale = scaleLinear()
        .domain([minValue, maxValue])
        .range([10, Math.min(popupWidth, popupHeight) / 5]);

      const colorScale = scaleSequential(interpolateCool).domain([
        minValue,
        maxValue,
      ]);

      return filteredData.map((tag) => ({
        text: tag.text,
        value: tag.value,
        size: fontScale(tag.value),
        color: colorScale(tag.value),
      }));
    }, [tagData, popupWidth, popupHeight]);

    useEffect(() => {
      if (computedTagData.length === 0) {
        setCloudWords([]);
        return;
      }

      const layout = d3Cloud<WordData>()
        .size([popupWidth, popupHeight])
        .words(computedTagData)
        .padding(2)
        .rotate(() => 0)
        .font("Impact")
        .fontSize((d) => d.size || 10)
        .on("end", (computedWords) => {
          const adjustedWords = computedWords.map((word) => {
            // 基準を中央に移動
            const adjustedX = (word.x || 0) + popupWidth / 2;
            const adjustedY = (word.y || 0) + popupHeight / 2;

            // 枠内に収めるよう調整
            const clampedX = Math.max(
              word.size! / 2,
              Math.min(popupWidth - word.size! / 2, adjustedX)
            );
            const clampedY = Math.max(
              word.size! / 2,
              Math.min(popupHeight - word.size! / 2, adjustedY)
            );

            return {
              ...word,
              x: clampedX,
              y: clampedY,
            };
          });
          setCloudWords(adjustedWords);
        });

      layout.start();
    }, [computedTagData, popupWidth, popupHeight]);

    if (cloudWords.length === 0) {
      return (
        <text x={10} y={10} fontSize={"10px"} fill="white">
          読み込み中...
        </text>
      );
    }

    return (
      <g>
        {cloudWords.map((word) => (
          <text
            key={word.text} // テキスト自体をキーに使用（重複しないことを前提）
            textAnchor="middle"
            transform={`translate(${word.x}, ${word.y}) rotate(${
              word.rotate || 0
            })`}
            fontSize={word.size}
            fontFamily="Impact"
            fill={word.color}
          >
            {word.text}
          </text>
        ))}
      </g>
    );
  }
);

export default TagCloud;
