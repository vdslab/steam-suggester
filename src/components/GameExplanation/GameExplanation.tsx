/* components/GameExplanation/GameExplanation.tsx */
'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import InfoIcon from '@mui/icons-material/Info';
import StarIcon from '@mui/icons-material/Star';
import LanguageIcon from '@mui/icons-material/Language';
import DeveloperModeIcon from '@mui/icons-material/DeveloperMode';
import Tooltip from '@mui/material/Tooltip';
import AppleIcon from '@mui/icons-material/Apple';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import CircularProgress from '@mui/material/CircularProgress';

import { SteamDetailsDataType } from "@/types/api/getSteamDetailType";
import { ISR_FETCH_INTERVAL } from "@/constants/DetailsConstants";

type Props = {
  steamGameId: string;
};

const GameExplanation: React.FC<Props> = ({ steamGameId }) => {
  const [node, setNode] = useState<SteamDetailsDataType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ゲームデータの取得
    const fetchGameData = async () => {
      try {
        const res = await fetch(
          `/api/details/getSteamGameDetail/${steamGameId}`,
          { next: { revalidate: ISR_FETCH_INTERVAL } }
        );
        if (!res.ok) {
          throw new Error("ゲームデータの取得に失敗しました。");
        }
        const data: SteamDetailsDataType = await res.json();
        setNode(data);
      } catch (err) {
        console.error(err);
        setError("ゲームデータの取得中にエラーが発生しました。");
      } finally {
        setLoading(false);
      }
    };

    fetchGameData();
  }, [steamGameId]);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!node) {
    return (
      <div className="flex justify-center items-center h-full">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="rounded-lg overflow-hidden border border-gray-400 bg-gray-800 p-4">
      {/* ゲーム画像 */}
      <Image
        src={node.imgURL}
        alt={`${node.title} Header`}
        width={1000}
        height={500}
        className="w-full h-auto rounded"
      />

      {/* ゲームタイトル */}
      <h2 className="text-2xl font-bold text-white mt-4">{node.title}</h2>

      {/* Short Details */}
      <div className="flex items-start mt-2">
        <InfoIcon className="mt-1 mr-2 text-white" />
        <div className="p-1 short-details-scrollbar">
          <p className="text-sm text-gray-300">{node.shortDetails}</p>
        </div>
      </div>

      {/* Genres */}
      {node.genres && node.genres.length > 0 && (
        <div className="flex items-center space-x-2 text-white overflow-x-auto h-8 mt-4 genres-scrollbar">
          <strong>ジャンル:</strong>
          <div className="flex space-x-2 items-center">
            {node.genres.map((genre, index) => (
              <span
                key={index}
                className="bg-blue-600 text-xs text-white px-2 py-1 rounded flex-shrink-0 flex items-center"
              >
                {genre}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 詳細ジャンル */}
      {node.tags && node.tags.length > 0 && (
        <div className="text-white mt-2">
          <strong>詳細ジャンル:</strong>
          <div className="items-center mt-1">
            {node.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-green-600 text-xs text-white px-2 py-1 mr-1 rounded whitespace-nowrap"
                title={tag}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* デバイスサポート */}
      <div className="flex items-center space-x-2 mt-2">
        {node.device.windows && (
          <Tooltip title="Windows対応">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 448 512"
              className="text-white h-5 w-5"
              fill="currentColor"
            >
              <path d="M0 0h224v224H0zM224 0h224v224H224zM0 224h224v288H0zM224 224h224v288H224z" />
            </svg>
          </Tooltip>
        )}
        {node.device.mac && (
          <Tooltip title="Mac対応">
            <AppleIcon className="text-white h-5 w-5" />
          </Tooltip>
        )}

      {/* マルチプレイヤー情報 */}
        {node.isSinglePlayer && (
          <Tooltip title="Single Player">
            <PersonIcon className="text-white h-5 w-5" />
          </Tooltip>
        )}
        {node.isMultiPlayer && (
          <Tooltip title="Multiplayer">
            <GroupIcon className="text-white h-5 w-5" />
          </Tooltip>
        )}
      </div>

      {/* Developer & Release Date */}
      <div className="flex items-center mt-4">
        <DeveloperModeIcon className="mr-2 text-white" />
        <span className="text-sm text-gray-300">開発者: {node.developerName}</span>
      </div>
      <div className="flex items-center mt-1">
        <LanguageIcon className="mr-2 text-white" />
        <span className="text-sm text-gray-300">発売日: {node.releaseDate}</span>
      </div>

      {/* 価格 */}
      <div className="flex items-center mt-2">
        <StarIcon className="mr-2 text-yellow-500" />
        <span className="text-sm text-gray-300"><strong>価格:</strong></span>
        {node.salePrice && parseInt(node.salePrice, 10) < node.price ? (
          <>
            <span className="line-through text-gray-400 ml-2">¥{node.price}</span>
            <span className="text-red-500 ml-2">¥{node.salePrice}</span>
            <span className="text-white ml-2">{Math.round((parseInt(node.salePrice, 10) / node.price) * 100)}%Off</span>
          </>
        ) : (
          <span className="text-sm ml-2 text-gray-300">
            {node.price > 0 ? `¥${node.price}` : "無料"}
          </span>
        )}
      </div>

      {/* Play Time */}
      <div className="flex items-center mt-2">
        <StarIcon className="mr-2 text-yellow-500" />
        <span className="text-sm text-gray-300">プレイ時間: {node.playTime} 時間</span>
      </div>

      {/* Reviews */}
      {/* {node.review && (
        <div className="space-y-1 mt-2">
          <span className="text-sm font-semibold text-gray-300">レビュー:</span>
          <div className="flex flex-wrap">
            {Object.entries(node.review).map(([key, value]) => (
              <div key={key} className="flex items-center mr-2 mb-1">
                <StarIcon className="text-yellow-400 mr-1" />
                <span className="text-xs text-gray-300">{key}: {Math.round(value * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      )} */}
    </div>
  );
};

export default GameExplanation;
