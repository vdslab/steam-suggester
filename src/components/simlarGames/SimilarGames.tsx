'use client';
import React, { useState, useEffect } from "react";
import createNetwork from "@/hooks/createNetwork";
import DisplayGame from "./DisplayGame";
import { DetailsPropsType, SimilarGamePropsType } from "@/types/DetailsType";
import { DEFAULT_FILTER, DEFAULT_SLIDER } from "@/constants/DEFAULT_FILTER";
import { getFilterData, getGameIdData, getSliderData } from "@/hooks/indexedDB";
import { CircularProgress } from '@mui/material';
import fetchWithCache from "@/hooks/fetchWithCache";

type GameType = {
  steamGameId: string;
  twitchGameId: string;
}

const SimilarGames = (props: DetailsPropsType) => {

  const { steamGameId, twitchGameId } = props;

  const [data, setData] = useState<SimilarGamePropsType[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    (async () => {
      try {
        const filter = await getFilterData() ?? DEFAULT_FILTER;
        const gameIds = await getGameIdData() ?? [];
        const slider = await getSliderData() ?? DEFAULT_SLIDER;
        const { similarGames } = await createNetwork(filter, gameIds, slider);
    
        if (similarGames && similarGames[steamGameId]) {
          const promises = similarGames[steamGameId].map(async (game: GameType) => {
            const d = await fetchWithCache(`${process.env.NEXT_PUBLIC_CURRENT_URL}/api/details/getSteamGameDetail/${game.steamGameId}`);
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
  }, []);

  if (!data || loading) {
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
    <div className="grid grid-cols-1 gap-4">
      {data.map((game: SimilarGamePropsType) => (
        <DisplayGame 
          key={game.steamGameId} 
          title={game.title} 
          imgURL={game.imgURL} 
          steamGameId={game.steamGameId} 
          twitchGameId={game.twitchGameId} 
        />
      ))}
    </div>
  );
}

export default SimilarGames;
