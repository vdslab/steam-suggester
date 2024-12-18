/* components/GameExplanation/MatchDegree.tsx */
'use client';

import React, { useState, useEffect } from "react";
import CircularProgress from '@mui/material/CircularProgress';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import Tooltip from '@mui/material/Tooltip';
import { ISR_FETCH_INTERVAL } from "@/constants/DetailsConstants";

type Props = {
  steamGameId: string;
  twitchGameId: string;
  genres: string[];
  priceRange: { startPrice: number; endPrice: number };
  modes: string[];
  devices: string[];
  playtimes: string[];
};

type SteamDetailsDataType = {
  genres: string[];
  price: number;
  salePrice: number | null;
  isSinglePlayer: boolean;
  isMultiPlayer: boolean;
  device: {
    windows: boolean;
    mac: boolean;
  };
  // その他の必要なフィールド
};

const MatchDegree: React.FC<Props> = ({ steamGameId, twitchGameId, genres, priceRange, modes, devices, playtimes }) => {
  const [node, setNode] = useState<SteamDetailsDataType | null>(null);
  const [overallMatch, setOverallMatch] = useState<number | null>(null);
  const [genreMatch, setGenreMatch] = useState<number | null>(null);
  const [priceMatch, setPriceMatch] = useState<number | null>(null);
  const [modesMatch, setModesMatch] = useState<boolean>(false);
  const [devicesMatch, setDevicesMatch] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      } catch (err: any) {
        console.error(err);
        setError("ゲームデータの取得中にエラーが発生しました。");
      } finally {
        setLoading(false);
      }
    };

    fetchGameData();
  }, [steamGameId]);

  useEffect(() => {
    if (node) {
      // ジャンル一致度の計算
      const preferredGenres = genres;
      const matchingGenres = node.genres.filter((genre) =>
        preferredGenres.includes(genre)
      );
      const genreScore =
        preferredGenres.length === 0
          ? 100
          : Math.min(
              (matchingGenres.length / preferredGenres.length) * 100,
              100
            );
      setGenreMatch(Math.round(genreScore));

      // 価格一致度の計算
      const salePrice = typeof node.salePrice === 'string' ? parseFloat(node.salePrice) : node.salePrice;
      const price = typeof node.price === 'string' ? parseFloat(node.price) : node.price;
      const gamePrice = salePrice || price;

      if (isNaN(gamePrice)) {
        setPriceMatch(0);
      } else {
        const { startPrice, endPrice } = priceRange;
        let priceScore = 0;
        if (gamePrice >= startPrice && gamePrice <= endPrice) {
          priceScore = 100;
        } else {
          // 希望価格範囲からの距離を計算
          const distance =
            gamePrice < startPrice
              ? startPrice - gamePrice
              : gamePrice - endPrice;
          // スコアが0になる最大距離を設定（例として希望価格範囲の最大値）
          const maxDistance = Math.max(startPrice, endPrice, 1); // ゼロ除算を防ぐ
          priceScore = Math.max(100 - (distance / maxDistance) * 100, 0);
        }
        setPriceMatch(Math.round(priceScore));
      }

      // プレイモードの一致チェック
      if (modes.length === 0) {
        setModesMatch(true); // モードが選択されていない場合は自動的に一致
      } else {
        // ゲームがユーザーの選択したすべてのモードをサポートしているか
        const gameModes: string[] = [];
        if (node.isSinglePlayer) gameModes.push("Single Player");
        if (node.isMultiPlayer) gameModes.push("Multiplayer");

        const allModesMatch = modes.every(mode => gameModes.includes(mode));
        setModesMatch(allModesMatch);
      }

      // 対応デバイスの一致チェック
      if (devices.length === 0) {
        setDevicesMatch(true); // デバイスが選択されていない場合は自動的に一致
      } else {
        const gameDevices: string[] = [];
        if (node.device.windows) gameDevices.push("Windows");
        if (node.device.mac) gameDevices.push("Mac");

        const allDevicesMatch = devices.every(device => gameDevices.includes(device));
        setDevicesMatch(allDevicesMatch);
      }

      // 全体の一致度をジャンルと価格の平均で計算
      const overall =
        (genreScore + (priceMatch !== null ? priceMatch : 0)) / 2;
      setOverallMatch(Math.round(overall));
    }
  }, [node, genres, priceRange, modes, devices, playtimes]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  if (!node || overallMatch === null) {
    return null;
  }

  return (
    <div className="rounded-lg overflow-hidden border border-gray-400 bg-gray-700 p-4">
      <h3 className="text-xl font-semibold text-white">一致度</h3>
      <div className="mt-2">
        <div className="flex items-center">
          <span className="text-sm text-gray-300">全体の一致度:</span>
          <span className="ml-2 text-yellow-300 text-sm">{overallMatch}%</span>
        </div>
        <div className="flex items-center mt-1">
          <span className="text-sm text-gray-300">ジャンルの一致度:</span>
          <span className="ml-2 text-yellow-300 text-sm">{genreMatch}%</span>
        </div>
        <div className="flex items-center mt-1">
          <span className="text-sm text-gray-300">価格の一致度:</span>
          <span className="ml-2 text-yellow-300 text-sm">{priceMatch}%</span>
        </div>
        <div className="flex items-center mt-1">
          <span className="text-sm text-gray-300">プレイモード:</span>
          {modesMatch ? (
            <CheckCircleIcon className="ml-2 text-green-500" />
          ) : (
            <ErrorIcon className="ml-2 text-red-500" />
          )}
        </div>
        <div className="flex items-center mt-1">
          <span className="text-sm text-gray-300">対応デバイス:</span>
          {devicesMatch ? (
            <CheckCircleIcon className="ml-2 text-green-500" />
          ) : (
            <ErrorIcon className="ml-2 text-red-500" />
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchDegree;
