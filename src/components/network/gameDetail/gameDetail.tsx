/* GameSearchPanel.tsx */
"use client";

import { useEffect, useRef } from "react";
import { NodeType, SteamListType } from "@/types/NetworkType";
import Image from "next/image";
import HelpTooltip from "../HelpTooltip";

import Tooltip from "@mui/material/Tooltip";
import Link from "next/link";
import Popularity from "./Popularity2";
import ReviewCloud from "../../charts/ReviewCloud";
import { SteamDetailsDataType } from "@/types/api/getSteamDetailType";

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

type Props = {
  nodes: NodeType[];
  selectedIndex: number;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
  setIsNetworkLoading: React.Dispatch<React.SetStateAction<boolean>>;
  steamListData: SteamListType[];
  setOpenPanel: React.Dispatch<React.SetStateAction<string | null>>;
  selectedTags: string[];
  setSelectedTags: React.Dispatch<React.SetStateAction<string[]>>;
};

const GameSearchPanel = (props: Props) => {
  const {
    steamListData,
    nodes,
    selectedIndex,
    setSelectedIndex,
    setIsNetworkLoading,
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

  const addSelectedTags = (newTag:string) => {
    if(selectedTags.includes(newTag)) return;
    setSelectedTags([...selectedTags, newTag]);
    setOpenPanel("highlight");
  }

  return (
    <div className="flex-1 bg-gray-800 rounded-l-lg shadow-md flex flex-col space-y-4 overflow-y-scroll h-full relative">
      {/* 選択されたゲームの詳細表示 */}
      {selectedIndex !== -1 && nodes[selectedIndex] ? (
        <div className="rounded-lg" ref={selectedDetailRef}>
          {/* ゲーム詳細内容 */}
          <div className="flex flex-col">
            {/* 画像とアイコンのコンテナ */}
            {nodes[selectedIndex].imgURL && (
              <div className="relative">
                <Image
                  src={nodes[selectedIndex].imgURL}
                  alt={nodes[selectedIndex].title}
                  width={600}
                  height={400}
                  style={{ borderRadius: "4px" }}
                  className="object-cover rounded mb-2"
                />
                {/* 画像右下 */}
                <div className="absolute bottom-2 right-2 flex items-center space-x-1 z-10">
                  {/* デバイスサポート */}
                  {nodes[selectedIndex].device.windows && (
                    <Tooltip title="Windows対応">
                      <WindowsIcon size={20} />
                    </Tooltip>
                  )}
                  {nodes[selectedIndex].device.mac && (
                    <Tooltip title="Mac対応">
                      <AppleIcon className="text-white h-5 w-5" />
                    </Tooltip>
                  )}

                  {/* マルチプレイヤー情報 */}
                  {nodes[selectedIndex].isSinglePlayer && (
                    <Tooltip title="Single Player">
                      <PersonIcon className="text-white h-5 w-5" />
                    </Tooltip>
                  )}
                  {nodes[selectedIndex].isMultiPlayer && (
                    <Tooltip title="Multiplayer">
                      <GroupIcon className="text-white h-5 w-5" />
                    </Tooltip>
                  )}
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
              <HelpTooltip title="ゲームレビュー文に多く含まれた単語ほど、大きく表示されます。" />
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
