"use client";

import { useEffect, useRef, useState } from "react";
import { NodeType } from "@/types/NetworkType";
import Image from "next/image";
import HelpTooltip from "../common/HelpTooltip";

import Tooltip from "@mui/material/Tooltip";
import Link from "next/link";
import Popularity from "./Popularity2";
import ReviewCloud, { getColorByScore } from "../charts/ReviewCloud";

// Icons
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import WindowsIcon from "@/components/common/WindowsIcon";
import AppleIcon from "@mui/icons-material/Apple";
import PersonIcon from "@mui/icons-material/Person";
import GroupIcon from "@mui/icons-material/Group";
import BuildIcon from "@mui/icons-material/Build";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CurrencyYenIcon from "@mui/icons-material/CurrencyYen";
import RateReviewIcon from "@mui/icons-material/RateReview";
import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined";
import ThumbDownAltOutlinedIcon from "@mui/icons-material/ThumbDownAltOutlined";

type Props = {
  nodes: NodeType[];
  selectedIndex: number;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
  setOpenPanel: React.Dispatch<React.SetStateAction<string | null>>;
  selectedTags: string[];
  setSelectedTags: React.Dispatch<React.SetStateAction<string[]>>;
};

const GameSearchPanel = (props: Props) => {
  const {
    nodes,
    selectedIndex,
    setSelectedIndex,
    setOpenPanel,
    selectedTags,
    setSelectedTags,
  } = props;

  // Ref for the selected game detail
  const selectedDetailRef = useRef<HTMLDivElement | null>(null);

  // 自動スクロール機能の追加
  useEffect(() => {
    if (selectedIndex !== -1 && selectedDetailRef.current) {
      selectedDetailRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [selectedIndex]);

  const addSelectedTags = (newTag: string) => {
    if (selectedTags.includes(newTag)) return;
    setSelectedTags([...selectedTags, newTag]);
    setOpenPanel("highlight");
  };

  const [currentSlide, setCurrentSlide] = useState(0); // 現在のスライドインデックス
  const screenshots = [
    nodes[selectedIndex].imgURL,
    nodes[selectedIndex].screenshots,
  ].flat();
  // スライドショーの自動切り替え
  useEffect(() => {
    if (selectedIndex !== -1 && screenshots.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prevSlide) => {
          const screenshots = nodes[selectedIndex].screenshots || [];
          return (prevSlide + 1) % screenshots.length;
        });
      }, 2000); // 2秒ごとに切り替え
      return () => clearInterval(interval); // クリーンアップ
    }
  }, [selectedIndex, nodes]);

  return (
    <div className="flex-1 bg-gray-800 rounded-l-lg shadow-md flex flex-col space-y-4 overflow-y-scroll h-full relative">
      {/* 選択されたゲームの詳細表示 */}
      {selectedIndex !== -1 && nodes[selectedIndex] ? (
        <div className="rounded-lg" ref={selectedDetailRef}>
          {/* ゲーム詳細内容 */}
          <div className="flex flex-col">
            {/* 画像とアイコンのコンテナ */}
            {/* スライドショー */}
            {screenshots && (
              <div className="relative">
                {screenshots.map((screenshot, index) => (
                  <Image
                    key={index}
                    src={screenshot as string}
                    alt={`${nodes[selectedIndex].title} screenshot ${
                      index + 1
                    }`}
                    width={600}
                    height={400}
                    style={{
                      borderRadius: "4px",
                      opacity: currentSlide === index ? 1 : 0,
                      transition: "opacity 0.5s ease-in-out",
                      position:
                        currentSlide === index ? "relative" : "absolute",
                      top: 0,
                      left: 0,
                    }}
                    className="object-cover rounded mb-2"
                  />
                ))}
                {/* 画像右上に閉じるボタン */}
                <div
                  className="absolute top-2 right-2 flex items-center justify-center w-8 h-8 bg-black bg-opacity-50 rounded-full cursor-pointer z-20 transition-transform duration-200 hover:bg-opacity-75 hover:scale-110"
                  onClick={() => setSelectedIndex(-1)}
                >
                  <span className="text-white text-xl font-bold transition-colors duration-200 hover:text-red-400">
                    ×
                  </span>
                </div>
              </div>
            )}

            <div className="px-2">
              <div className="flex items-center">
                {/* ゲームタイトル */}
                <h2 className="text-white text-xl font-semibold">
                  <Link
                    href={`https://store.steampowered.com/app/${nodes[selectedIndex].steamGameId}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-white hover:underline"
                  >
                    {nodes[selectedIndex].title}
                  </Link>
                </h2>

                {/* Steamリンク */}
                <Tooltip title="Steamで開く">
                  <Link
                    href={`https://store.steampowered.com/app/${nodes[selectedIndex].steamGameId}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-blue-400"
                  >
                    <OpenInNewIcon fontSize="small" />
                  </Link>
                </Tooltip>
              </div>

              {/* 開発者、発売日、価格 */}
              <div className="flex items-center text-xs space-x-4 mt-1 mb-2">
                {/* 開発者 */}
                <div className="flex items-center">
                  <Tooltip title="開発者">
                    <BuildIcon
                      fontSize="small"
                      className="text-gray-400 mr-1"
                    />
                  </Tooltip>
                  <span className="text-gray-300">
                    {nodes[selectedIndex].developerName}
                  </span>
                </div>

                {/* 発売日 */}
                <div className="flex items-center">
                  <Tooltip title="発売日">
                    <CalendarTodayIcon
                      fontSize="small"
                      className="text-gray-400 mr-1"
                    />
                  </Tooltip>
                  <span className="text-gray-300">
                    {nodes[selectedIndex].releaseDate}
                  </span>
                </div>

                {/* 価格 */}
                <div className="flex items-center">
                  <Tooltip title="価格">
                    <CurrencyYenIcon
                      fontSize="small"
                      className="text-gray-400 mr-1"
                    />
                  </Tooltip>
                  <span className="text-gray-300">
                    {nodes[selectedIndex].salePrice &&
                    parseInt(nodes[selectedIndex].salePrice, 10) <
                      nodes[selectedIndex].price ? (
                      <>
                        <span className="line-through text-gray-400">
                          {nodes[selectedIndex].price}
                        </span>
                        <span className="text-red-500 ml-1">
                          {nodes[selectedIndex].salePrice}
                        </span>
                      </>
                    ) : nodes[selectedIndex].price ? (
                      `${nodes[selectedIndex].price}`
                    ) : (
                      "無料"
                    )}
                  </span>
                </div>
              </div>

              {/* ゲーム説明文 */}
              <div>
                {nodes[selectedIndex].shortDetails && (
                  <div className="text-white text-sm mt-1 h-24 overflow-y-auto mb-2">
                    {nodes[selectedIndex].shortDetails}
                  </div>
                )}
              </div>

              {/* タグ */}
              <div className="text-white">
                {nodes[selectedIndex].tags &&
                  nodes[selectedIndex].tags.length > 0 && (
                    <div className="line-clamp-2 overflow-hidden">
                      {nodes[selectedIndex].tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-green-500 text-xs p-0.5 mr-1 mb-1 rounded inline-block whitespace-nowrap cursor-pointer select-none"
                          onClick={() => addSelectedTags(tag)}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
              </div>
            </div>
          </div>

          {/* レビュー分析タイトルの追加 */}
          <div className="px-2 mt-2">
            <h3 className="text-white text-lg font-semibold mb-2 flex items-center">
              <RateReviewIcon className="mr-1" />
              レビュー分析
              <HelpTooltip title="ゲームレビュー文に多く含まれた単語ほど、大きく表示されます。単語の色はその単語が含まれているレビューの評判によって変化します。" />
              <div className="flex items-center ml-8 relative">
                <span className="absolute left-0 -translate-x-4">
                  <ThumbDownAltOutlinedIcon />
                </span>
                <div
                  className="h-2 w-32 mx-4 rounded"
                  style={{
                    background: `linear-gradient(to right,  ${getColorByScore(
                      -1
                    )}, ${getColorByScore(0)}, ${getColorByScore(1)})`,
                  }}
                />
                <span className="absolute right-0 translate-x-4">
                  <ThumbUpAltOutlinedIcon />
                </span>
              </div>
            </h3>
            <ReviewCloud reviewData={nodes[selectedIndex].review} />
          </div>

          {/* Populatityコンポーネント */}
          <Popularity nodes={nodes} selectedIndex={selectedIndex} />
        </div>
      ) : (
        <div className="text-white text-center pt-24">
          ゲームを選択してください。
        </div>
      )}
    </div>
  );
};

export default GameSearchPanel;
