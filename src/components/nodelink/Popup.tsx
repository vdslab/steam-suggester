"use client";
import React, { useMemo } from "react";
import { LinkType, NodeType } from "@/types/NetworkType";
import TagCloud from "../charts/TagCloud";
import { TAG_LIST } from "@/constants/TAG_LIST";

type Props = {
  node: NodeType;
  link: LinkType;
};

// トランケーション関数の定義
const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
};

const PopupComponent: React.FC<Props> = ({ node, link }) => {
  // 早期リターン前にすべてのHooksを呼び出す
  // FLAT_TAG_LIST は定数なので useMemo を使用してメモ化
  const FLAT_TAG_LIST = useMemo(() => Object.values(TAG_LIST).flat(), []);

  // 共通タグリストの生成をメモ化
  const commonTagList = useMemo(() => {
    return [...new Set([...link.source.tags, ...link.target.tags])];
  }, [link.source.tags, link.target.tags]);

  // rawData の生成をメモ化
  const rawData = useMemo(() => {
    return FLAT_TAG_LIST.map((tag: string, index: number) => ({
      text: tag,
      value: (link.elementScores as number[])[index],
    }));
  }, [FLAT_TAG_LIST, link.elementScores]);

  // tagData の生成をメモ化
  const tagData = useMemo(() => {
    const seenTags = new Set<string>();
    return rawData.filter((item) => {
      if (seenTags.has(item.text) || !commonTagList.includes(item.text)) {
        return false;
      } else {
        seenTags.add(item.text);
        return true;
      }
    });
  }, [rawData, commonTagList]);

  // 類似度スコアに基づく色をメモ化
  const similarityColor = useMemo(() => {
    return `hsl(${((link.similarity as number) / 100) * 120}, 100%, 50%)`;
  }, [link.similarity]);

  // ポップアップのサイズとオフセットをメモ化
  const { popupWidth, popupHeight, offsetX, offsetY, imageWidth } =
    useMemo(() => {
      const width = 400;
      const height = 500;
      const offsetX = (node.circleScale as number) * 20;
      const offsetY = -height / 2;
      const imgWidth = width / 3;
      return {
        popupWidth: width,
        popupHeight: height,
        offsetX,
        offsetY,
        imageWidth: imgWidth,
      };
    }, [node.circleScale]);

  // featureVector がない場合は早期リターン
  if (!node.featureVector) {
    return null;
  }

  // タイトルの最大文字数を定義
  const maxTitleLength = 18; // 必要に応じて調整

  return (
    <g transform={`translate(${offsetX}, ${offsetY})`}>
      <g>
        {/* ポップアップの背景 */}
        <rect
          x={0}
          y={0}
          width={popupWidth}
          height={popupHeight}
          fill="rgb(31 41 55 / var(--tw-bg-opacity, 1))"
          stroke="#ccc"
          rx={8}
          ry={8}
        />
        {/* 類似度スコア */}
        <text x={10} y={25} fontSize="18px" fontWeight="bold" fill="white">
          類似率：
        </text>
        <text
          x={popupWidth / 2}
          y={popupHeight / 6 - 10}
          fontSize="32px"
          fontWeight="bold"
          fill={similarityColor}
          textAnchor="middle"
        >
          {link.similarity}%
        </text>
        <text
          x={popupWidth / 2}
          y={popupHeight / 6 + 30}
          fontSize="32px"
          fontWeight="bold"
          fill="white"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          ⇔
        </text>
        {/* ゲーム画像とタイトル */}
        <g>
          {/* 左側のゲーム画像とタイトル */}
          <g>
            <image
              href={link.source.imgURL}
              x={10}
              y={30}
              width={imageWidth}
              preserveAspectRatio="xMidYMid slice"
            />
            <text
              x={10 + imageWidth / 2}
              y={30 + popupHeight / 6}
              fontSize="14px"
              fill="white"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {truncateText(link.source.title, maxTitleLength)}
            </text>
          </g>
          {/* 右側のゲーム画像とタイトル */}
          <g>
            <image
              href={link.target.imgURL}
              x={popupWidth - imageWidth - 10}
              y={30}
              width={imageWidth}
              preserveAspectRatio="xMidYMid slice"
            />
            <text
              x={popupWidth - imageWidth / 2 - 10}
              y={30 + popupHeight / 6}
              fontSize="14px"
              fill="white"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {truncateText(link.target.title, maxTitleLength)}
            </text>
          </g>
        </g>
        {/* 仕切り線 */}
        <line
          x1={0}
          y1={popupHeight / 3 - 40}
          x2={popupWidth}
          y2={popupHeight / 3 - 40}
          stroke="#ccc"
          strokeWidth={0.2}
        />
        {/* 類似している要因のラベル */}
        <text x={10} y={popupHeight / 3 - 14} fontSize="18px" fill="white">
          <tspan fontWeight="bold">類似している要素:</tspan>
        </text>
        {/* ワードクラウドの表示 */}
        <g transform={`translate(0,${popupHeight / 3})`}>
          <TagCloud
            tagData={tagData}
            popupWidth={popupWidth}
            popupHeight={(popupHeight * 2) / 3}
          />
        </g>
      </g>
    </g>
  );
};

// React.memo でラップし、displayName を設定
const Popup = React.memo(PopupComponent);
Popup.displayName = "Popup";

export default Popup;
