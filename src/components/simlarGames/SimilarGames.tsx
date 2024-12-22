'use client';

import { useState, useEffect } from "react";
import createNetwork from "@/hooks/createNetwork";
import DisplayGame from "./DisplayGame";
import { SimilarGameValueType } from "@/types/DetailsType";
import { DEFAULT_FILTER, DEFAULT_SLIDER } from "@/constants/DEFAULT_FILTER";
import { getFilterData, getGameIdData, getSliderData } from "@/hooks/indexedDB";
import { CircularProgress } from '@mui/material';
import fetchWithCache from "@/hooks/fetchWithCache";
import { SteamDetailsDataType } from "@/types/api/getSteamDetailType";

type Props = {
  steamGameId: string;
  twitchGameId: string;
  steamAllData: SteamDetailsDataType[];
}

const SimilarGames = (props: Props) => {

  const { steamGameId, steamAllData } = props;

  const [data, setData] = useState<SteamDetailsDataType[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    (async () => {
      try {
        const filter = await getFilterData() ?? DEFAULT_FILTER;
        const gameIds = await getGameIdData() ?? [];
        const slider = await getSliderData() ?? DEFAULT_SLIDER;
        const { similarGames } = await createNetwork(steamAllData, filter, gameIds, slider);
    
        if (similarGames && similarGames[steamGameId]) {
          const promises = similarGames[steamGameId].map(async (game: SimilarGameValueType) => {
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
  }, [steamGameId]);

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
    <div className="grid grid-cols-2 gap-4">
      {data.map((node: SteamDetailsDataType) => (
        <DisplayGame
          key={node.steamGameId}
          node={node}
        />
      ))}
    </div>
  );
}

export default SimilarGames;
