/* pages/game/[id]/page.tsx */
'use client';

import React, { useState, useEffect } from 'react';
import GameTitle from "@/components/common/GameTitle";
import { DetailsHeader } from "@/components/common/Headers";
import DistributorVideos from "@/components/distributorVideos/DistributorVideos";
import GameExplanation from "@/components/GameExplanation/GameExplanation";
import Popularity from "@/components/popularity/Popularity";
import SimilarGames from "@/components/simlarGames/SimilarGames";
import UserSelection from '@/components/GameExplanation/UserSelection';
import AccordionSection from '@/components/common/AccordionSection';
import CircularProgress from '@mui/material/CircularProgress';

import { getFilterData } from '@/hooks/indexedDB';
import { SteamDetailsDataType } from "@/types/api/getSteamDetailType";
import { ISR_FETCH_INTERVAL } from "@/constants/DetailsConstants";

export default function Page({ searchParams }: { searchParams: { steam_id?: string; twitch_id?: string } }) {
  const steamGameId = searchParams.steam_id || "";
  const twitchGameId = searchParams.twitch_id || "";

  const [filterData, setFilterData] = useState<{
    genres: string[];
    priceRange: { startPrice: number; endPrice: number };
    modes: string[];
    devices: string[];
    playtimes: string[];
  } | null>(null);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const data = await getFilterData();
        if (data) {
          const genres = Object.keys(data.Genres).filter((genre) => data.Genres[genre]);
          const priceRange = {
            startPrice: data.Price.startPrice,
            endPrice: data.Price.endPrice,
          };
          const modes = [];
          if (data.Mode.isSinglePlayer) modes.push("Single Player");
          if (data.Mode.isMultiPlayer) modes.push("Multiplayer");
          const devices = [];
          if (data.Device.windows) devices.push("Windows");
          if (data.Device.mac) devices.push("Mac");
          const playtimes = Object.keys(data.Playtime).filter((time) => data.Playtime[time]);

          setFilterData({ genres, priceRange, modes, devices, playtimes });
        } else {
          setError("フィルターデータが見つかりませんでした。");
        }
      } catch (err) {
        console.error(err);
        setError("フィルターデータの取得中にエラーが発生しました。");
      }
    };

    fetchFilterData();
  }, []);

  if (error) {
    return <div className="text-red-500 text-center mt-4">{error}</div>;
  }

  if (!filterData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="bg-gray-800">
      <DetailsHeader />
      <div className="container mx-auto p-4 max-w-7xl">
        {/* ゲームタイトル */}
        <div className="mb-6">
          <GameTitle steamGameId={steamGameId} twitchGameId={twitchGameId} />
        </div>

        {/* メインレイアウト: 3カラム */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左カラム: UserSelection */}
          <div className="lg:col-span-1">
            <UserSelection
              genres={filterData.genres}
              priceRange={filterData.priceRange}
              modes={filterData.modes}
              devices={filterData.devices}
              playtimes={filterData.playtimes}
            />
          </div>

          {/* 中央カラム: GameExplanation */}
          <div className="lg:col-span-1">
            <GameExplanation
              steamGameId={steamGameId}
              twitchGameId={twitchGameId}
              genres={filterData.genres}
              priceRange={filterData.priceRange}
              modes={filterData.modes}
              devices={filterData.devices}
              playtimes={filterData.playtimes}
            />
          </div>

          {/* 右カラム: Accordionセクション */}
          <div className="lg:col-span-1 space-y-6">
            {/* 類似しているゲーム */}
            <AccordionSection title="類似しているゲーム">
              <SimilarGames steamGameId={steamGameId} twitchGameId={twitchGameId} />
            </AccordionSection>

            {/* 流行度 */}
            <AccordionSection title="流行度">
              <Popularity twitchGameId={twitchGameId} steamGameId={steamGameId} />
            </AccordionSection>

            {/* 配信者クリップ */}
            <AccordionSection title="配信者クリップ">
              <DistributorVideos twitchGameId={twitchGameId} steamGameId={steamGameId} />
            </AccordionSection>
          </div>
        </div>
      </div>
    </div>
 );
}
