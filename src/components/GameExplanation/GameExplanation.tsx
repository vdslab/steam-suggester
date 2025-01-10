/* components/GameExplanation/GameExplanation.tsx */
"use client";
import Image from "next/image";
import StarIcon from "@mui/icons-material/Star";
import LanguageIcon from "@mui/icons-material/Language";
import DeveloperModeIcon from "@mui/icons-material/DeveloperMode";
import Tooltip from "@mui/material/Tooltip";
import AppleIcon from "@mui/icons-material/Apple";
import PersonIcon from "@mui/icons-material/Person";
import GroupIcon from "@mui/icons-material/Group";
import CircularProgress from "@mui/material/CircularProgress";

import { SteamDetailsDataType } from "@/types/api/getSteamDetailType";
import WindowsIcon from "../common/WindowsIcon";

type Props = {
  steamGameId: string;
  steamDetailData: SteamDetailsDataType;
};

const GameExplanation = ({ steamGameId, steamDetailData }: Props) => {

  if (!steamDetailData) {
    return (
      <div className="flex justify-center items-center h-full">
        <CircularProgress />
      </div>
    );
  }

  const {
    imgURL,
    title,
    shortDetails,
    genres,
    tags,
    device,
    isSinglePlayer,
    isMultiPlayer,
    developerName,
    releaseDate,
    salePrice,
    price,
    playTime,
  } = steamDetailData;

  return (
    <div className="rounded-lg overflow-hidden border border-gray-400 bg-gray-800 p-4">
      {/* Short Details */}
      <div className="flex items-start mt-2">
        <Image
          src={imgURL}
          alt={`${title} Header`}
          width={1000}
          height={500}
          className="w-1/2 h-auto rounded mr-2"
          priority
        />
        <div className="p-1 short-details-scrollbar">
          <p className="text-sm text-gray-300">{shortDetails}</p>
        </div>
      </div>

      {/* Genres */}
      {genres && genres.length > 0 && (
        <div className="flex items-center space-x-2 text-white overflow-x-auto h-8 mt-4 genres-scrollbar">
          <strong>ジャンル:</strong>
          <div className="flex space-x-2 items-center">
            {genres.map((genre, index) => (
              <span
                key={index}
                className="bg-blue-600 text-xs text-white px-2 py-1 mr-1 rounded whitespace-nowrap"
                title={genre}
              >
                {genre}
              </span>
            ))}
          </div>
        </div>
    )}

      {/* 詳細ジャンル */}
      {tags && tags.length > 0 && (
        <div className="text-white mt-2">
          <strong>タグ:</strong>
          <div className="items-center mt-1">
            {tags.map((tag, index) => (
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
        {device.windows && (
          <Tooltip title="Windows対応">
            <WindowsIcon size={20}/>
          </Tooltip>
        )}
        {device.mac && (
          <Tooltip title="Mac対応">
            <AppleIcon className="text-white h-5 w-5" />
          </Tooltip>
        )}

        {/* マルチプレイヤー情報 */}
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
      <div className="flex items-center mt-4">
        <DeveloperModeIcon className="mr-2 text-white" />
        <span className="text-sm text-gray-300">デベロッパー: {developerName}</span>
      </div>
      <div className="flex items-center mt-1">
        <LanguageIcon className="mr-2 text-white" />
        <span className="text-sm text-gray-300">発売日: {releaseDate}</span>
      </div>

      {/* 価格 */}
      <div className="flex items-center mt-2">
        <StarIcon className="mr-2 text-yellow-500" />
        <span className="text-sm text-gray-300">
          <strong>価格:</strong>
        </span>
        {salePrice && parseInt(salePrice, 10) < price ? (
          <>
            <span className="line-through text-gray-400 ml-2">¥{price}</span>
            <span className="text-red-500 ml-2">¥{salePrice}</span>
            <span className="text-white ml-2">
              {Math.round((parseInt(salePrice, 10) / price) * 100)}%Off
            </span>
          </>
        ) : (
          <span className="text-sm ml-2 text-gray-300">
            {price > 0 ? `¥${price}` : "無料"}
          </span>
        )}
      </div>

      {/* Play Time */}
      <div className="flex items-center mt-2">
        <StarIcon className="mr-2 text-yellow-500" />
        <span className="text-sm text-gray-300">
          平均プレイ時間: {playTime} 時間
        </span>
      </div>

    </div>
  );
};

export default GameExplanation;
