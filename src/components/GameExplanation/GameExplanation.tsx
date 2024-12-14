/* GameExplanation.tsx */
'use client';

import { useEffect, useState } from "react";
import Image from "next/image";
import InfoIcon from '@mui/icons-material/Info';
import StarIcon from '@mui/icons-material/Star';
import DeveloperModeIcon from '@mui/icons-material/DeveloperMode';
import LanguageIcon from '@mui/icons-material/Language';
import Tooltip from '@mui/material/Tooltip';
import AppleIcon from '@mui/icons-material/Apple';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import { NodeType } from "@/types/NetworkType";

type Props = {
  steamGameId: string;
  twitchGameId: string;
};

const GameExplanation = ({ steamGameId, twitchGameId }: Props) => {
  const [gameDetails, setGameDetails] = useState<NodeType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isTagsExpanded, setIsTagsExpanded] = useState<boolean>(false);

  useEffect(() => {
    const fetchGameDetails = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_CURRENT_URL}/api/details/getSteamGameDetail/${steamGameId}`, {
          cache: 'no-store'
        });
        if (!res.ok) {
          throw new Error('Failed to fetch game details');
        }
        const data: NodeType = await res.json();
        setGameDetails(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGameDetails();
  }, [steamGameId]);

  if (isLoading) {
    return <div className="text-white">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!gameDetails) {
    return <div className="text-white">No details available.</div>;
  }

  const {
    title,
    imgURL,
    shortDetails,
    genres,
    tags,
    device,
    isSinglePlayer,
    isMultiPlayer,
    developerName,
    releaseDate,
    price,
    salePrice,
    playTime,
    review
  } = gameDetails;

  const toggleTags = () => {
    setIsTagsExpanded(prev => !prev);
  };

  return (
    <div className="container w-full mx-auto p-4 max-w-3xl">
      <div className="rounded-lg overflow-hidden border border-gray-400 bg-gray-800">
        {/* ゲーム画像 */}
        <Image src={imgURL} alt={`${title} Header`} width={1000} height={0} className="w-full h-auto object-cover" />

        {/* ゲームタイトル */}
        <h2 className="text-2xl font-bold text-white mt-4">{title}</h2>

        {/* Short Details */}
        <div className="flex items-start mt-2">
          <InfoIcon className="mt-1 mr-2 text-white" />
          <div className="max-h-20 overflow-y-auto p-1 short-details-scrollbar">
            <p className="text-sm text-gray-300">{shortDetails}</p>
          </div>
        </div>

        {/* ジャンル */}
        {genres && genres.length > 0 && (
          <div className="flex items-center space-x-2 overflow-x-auto h-8 mt-2 genres-scrollbar">
            <StarIcon className="flex-shrink-0 text-yellow-500" />
            <div className="flex space-x-2">
              {genres.map((genre, index) => (
                <span key={index} className="bg-blue-500 text-xs text-white px-2 py-1 rounded flex-shrink-0">
                  {genre}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* タグ */}
        {tags && tags.length > 0 && (
          <div className="text-white mt-2">
            <strong>タグ:</strong>
            <div className="flex items-center space-x-0.5 overflow-x-auto mt-1 h-8 tags-scrollbar">
              {tags.slice(0, isTagsExpanded ? tags.length : 3).map((tag, index) => (
                <span
                  key={index}
                  className="bg-green-500 text-xs text-white px-2 py-1 rounded whitespace-nowrap flex-shrink-0"
                  title={tag} // ツールチップ
                >
                  {tag}
                </span>
              ))}
              {tags.length > 3 && (
                <button
                  className="ml-2 text-blue-400 hover:underline focus:outline-none flex-shrink-0"
                  onClick={toggleTags}
                >
                  {isTagsExpanded ? "一部のタグのみ表示" : "..."}
                </button>
              )}
            </div>
          </div>
        )}

        {/* デバイスサポート */}
        <div className="flex items-center space-x-2 mt-2">
          {device.windows && (
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
          {device.mac && (
            <Tooltip title="Mac対応">
              <AppleIcon className="text-white h-5 w-5" />
            </Tooltip>
          )}
        </div>

        {/* Single Player / Multiplayer */}
        <div className="flex items-center space-x-2 mt-2">
          {isSinglePlayer && (
            <Tooltip title="Single Player">
              <PersonIcon className="text-white h-5 w-5" />
            </Tooltip>
          )}
          {isMultiPlayer && (
            <Tooltip title="Multiplayer">
              <GroupIcon className="text-white h-5 w-5" />
            </Tooltip>
          )}
        </div>

        {/* Developer & Release Date */}
        <div className="flex items-center mt-2">
          <DeveloperModeIcon className="mr-2 text-white" />
          <span className="text-sm text-gray-300">{developerName}</span>
        </div>
        <div className="flex items-center">
          <LanguageIcon className="mr-2 text-white" />
          <span className="text-sm text-gray-300">{releaseDate}発売</span>
        </div>

        {/* Play Time */}
        <div className="flex items-center mt-2">
          <StarIcon className="mr-2 text-yellow-500" />
          <span className="text-sm text-gray-300">Play Time: {playTime} hours</span>
        </div>

        {/* Reviews */}
        {review && (
          <div className="space-y-1 mt-2">
            <span className="text-sm font-semibold text-gray-300">Reviews:</span>
            <div className="flex flex-wrap">
              {Object.entries(review).map(([key, value]) => (
                <div key={key} className="flex items-center mr-2 mb-1">
                  <StarIcon className="text-yellow-400 mr-1" />
                  <span className="text-xs text-gray-300">{key}: {Math.round(value * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 価格 */}
        <div className="flex items-center mt-2">
          <StarIcon className="mr-2 text-yellow-500" />
          <span className="text-sm text-gray-300"><strong>価格:</strong></span>
          {salePrice && salePrice < price ? (
            <>
              <span className="line-through text-gray-400 ml-2">¥{price}</span>
              <span className="text-red-500 ml-2">¥{salePrice}</span>
            </>
          ) : (
            <span className="text-sm ml-2">{price ? `¥${price}` : "無料"}</span>
          )}
        </div>

        {/* アクションボタン */}
        <div className="mt-4 flex space-x-2">
          <button
            className="bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded"
            onClick={() => {
              window.location.href = `/desktop/details?steam_id=${steamGameId}&twitch_id=${twitchGameId}`;
            }}
          >
            詳細を確認
          </button>
          <button
            className="bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded"
            onClick={() => {
              // 必要に応じて閉じる処理を実装
            }}
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameExplanation;
