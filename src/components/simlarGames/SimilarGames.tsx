/* components/similarGames/SimilarGames.tsx */
'use client';
import React, { useState, useEffect } from "react";
import createNetwork from "@/hooks/createNetwork";
import DisplayGame from "./DisplayGame";
import { DetailsPropsType, SimilarGamePropsType } from "@/types/DetailsType";
import { DEFAULT_FILTER, DEFAULT_SLIDER } from "@/constants/DEFAULT_FILTER";
import { getFilterData, getGameIdData, getSliderData } from "@/hooks/indexedDB";
import { CircularProgress } from '@mui/material';

type GameType = {
  steamGameId: string;
  twitchGameId: string;
}

const SimilarGames = (props: DetailsPropsType) => {
  const [currentSteamGameId, setCurrentSteamGameId] = useState(props.steamGameId);
  const [currentTwitchGameId, setCurrentTwitchGameId] = useState(props.twitchGameId);
  const [data, setData] = useState<SimilarGamePropsType[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    setCurrentSteamGameId(props.steamGameId);
    setCurrentTwitchGameId(props.twitchGameId);
  }, [props.steamGameId, props.twitchGameId]);

  useEffect(() => {
    if (!isHydrated) return;

    (async () => {
      try {
        const filter = await getFilterData() ?? DEFAULT_FILTER;
        const gameIds = await getGameIdData() ?? [];
        const slider = await getSliderData() ?? DEFAULT_SLIDER;
        const { similarGames } = await createNetwork(filter, gameIds, slider);
    
        if (similarGames && similarGames[currentSteamGameId]) {
          const promises = similarGames[currentSteamGameId].map(async (game: GameType) => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_CURRENT_URL}/api/details/getSteamGameDetail/${game.steamGameId}`);
            if (!res.ok) throw new Error("ゲームデータの取得に失敗しました。");
            const d = await res.json();
            return {
              ...d, 
              steamGameId: game.steamGameId,
              twitchGameId: game.twitchGameId
            };
          });
    
          const fetchedData = await Promise.all(promises);
          setData(fetchedData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [currentSteamGameId, currentTwitchGameId, isHydrated]);

  if (!isHydrated || loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <CircularProgress />
      </div>
    );
  }

  if (data.length === 0) {
    return <div className="text-white text-center">類似するゲームが見つかりませんでした。</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.map((game: SimilarGamePropsType) => (
        <DisplayGame key={game.steamGameId} title={game.title} imgURL={game.imgURL} steamGameId={game.steamGameId} twitchGameId={game.twitchGameId} />
      ))}
    </div>
  );
}

export default SimilarGames;
