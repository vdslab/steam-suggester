/* GameDetailsCompact.tsx */
import React from "react";
import Tooltip from "@mui/material/Tooltip";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import AppleIcon from "@mui/icons-material/Apple";
import PersonIcon from "@mui/icons-material/Person";
import GroupIcon from "@mui/icons-material/Group";
import WindowsIcon from "@/components/common/WindowsIcon";

type GameDetailsCompactProps = {
  title: string;
  imgURL?: string;
  steamGameId: string;
  price: string | null;
  salePrice?: string;
  developerName: string;
  releaseDate: string;
  device: {
    windows: boolean;
    mac: boolean;
  };
  isSinglePlayer: boolean;
  isMultiPlayer: boolean;
  tags: string[];
};

const GameDetailsCompact: React.FC<GameDetailsCompactProps> = ({
  title,
  imgURL,
  steamGameId,
  price,
  salePrice,
  developerName,
  releaseDate,
  device,
  isSinglePlayer,
  isMultiPlayer,
  tags,
}) => {
  return (
    <div className="flex flex-col space-y-2 p-2 bg-gray-900 rounded-lg">
      {/* タイトルとSteamリンク */}
      <div className="flex items-center justify-between">
        <h2 className="text-white text-lg font-semibold truncate">{title}</h2>
        <Tooltip title="Steamで開く">
          <a
            href={`https://store.steampowered.com/app/${steamGameId}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400"
          >
            <OpenInNewIcon fontSize="small" />
          </a>
        </Tooltip>
      </div>

      {/* 開発者と発売日 */}
      <div className="flex items-center text-sm text-gray-300 space-x-4">
        <div className="flex items-center">
          <PersonIcon fontSize="small" className="mr-1" />
          <span>{developerName}</span>
        </div>
        <div className="flex items-center">
          <Tooltip title="発売日">
            <span className="mr-1">📅</span>
          </Tooltip>
          <span>{releaseDate}</span>
        </div>
      </div>

      {/* 価格情報 */}
      <div className="flex items-center text-sm space-x-2">
        <LocalOfferIcon fontSize="small" />
        {salePrice && parseInt(salePrice, 10) < parseInt(price, 10) ? (
          <span className="flex items-center space-x-1">
            <span className="line-through text-gray-400">¥{price}</span>
            <span className="text-red-500">¥{salePrice}</span>
            <span className="text-green-500">
              {Math.round(
                ((parseInt(price, 10) - parseInt(salePrice, 10)) /
                  parseInt(price, 10)) *
                  100
              )}
              % OFF
            </span>
          </span>
        ) : (
          <span>{price ? `¥${price}` : "無料"}</span>
        )}
      </div>

      {/* デバイスサポートとマルチプレイヤー情報 */}
      <div className="flex items-center space-x-2 text-gray-300">
        {device.windows && (
          <Tooltip title="Windows対応">
            <WindowsIcon size={16} />
          </Tooltip>
        )}
        {device.mac && (
          <Tooltip title="Mac対応">
            <AppleIcon className="h-4 w-4" />
          </Tooltip>
        )}
        {isSinglePlayer && (
          <Tooltip title="Single Player">
            <PersonIcon className="h-4 w-4" />
          </Tooltip>
        )}
        {isMultiPlayer && (
          <Tooltip title="Multiplayer">
            <GroupIcon className="h-4 w-4" />
          </Tooltip>
        )}
      </div>

      {/* タグ */}
      <div className="flex flex-wrap space-x-1 mt-1">
        {tags.slice(0, 3).map((tag, index) => (
          <span
            key={index}
            className="bg-green-500 text-xs p-0.5 mr-1 mb-1 rounded inline-block whitespace-nowrap"
          >
            {tag}
          </span>
        ))}
        {tags.length > 3 && (
          <span className="text-xs text-gray-400">+{tags.length - 3} 他</span>
        )}
      </div>
    </div>
  );
};

export default GameDetailsCompact;
