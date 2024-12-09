'use client';
import createNetwork from "@/hooks/createNetwork";
import Headline from "../common/Headline";
import DisplayGame from "./DisplayGame";
import { DetailsPropsType, SimilarGamePropsType } from "@/types/DetailsType";
import { DEFAULT_FILTER, DEFAULT_SLIDER } from "@/constants/DEFAULT_FILTER";
import { getFilterData, getGameIdData, getSliderData } from "@/hooks/indexedDB";
import { useEffect, useState } from "react";

type GameType = {
  steamGameId: string;
  twitchGameId: string;
}

const SimilarGames = (props: DetailsPropsType) => {
  const [currentSteamGameId, setCurrentSteamGameId] = useState(props.steamGameId);
  const [currentTwitchGameId, setCurrentTwitchGameId] = useState(props.twitchGameId);
  const [data, setData] = useState<SimilarGamePropsType[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

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
      const filter = await getFilterData() ?? DEFAULT_FILTER;
      const gameIds = await getGameIdData() ?? [];
      const slider = await getSliderData() ?? DEFAULT_SLIDER;
      const { similarGames } = await createNetwork(filter, gameIds, slider);
  
      if (similarGames && similarGames[currentSteamGameId]) {
        const promises = similarGames[currentSteamGameId].map(async (game: GameType) => {
          const res = await fetch(`${process.env.NEXT_PUBLIC_CURRENT_URL}/api/details/getSteamGameDetail/${game.steamGameId}`);
          const d = await res.json();
          return {
            ...d, 
            steamGameId: game.steamGameId,
            twitchGameId: game.twitchGameId
          };
        });
  
        const data = await Promise.all(promises);
        setData(data);
      }
    })();
  }, [currentSteamGameId, currentTwitchGameId, isHydrated]);

  if (!isHydrated) return null;

  return (
    <div>
      <Headline txt="類似してるゲーム" />
      {data.map((game: SimilarGamePropsType) => (
        <DisplayGame key={game.imgURL} title={game.title} imgURL={game.imgURL} steamGameId={game.steamGameId} twitchGameId={game.twitchGameId} />
      ))}
    </div>
  );
}

export default SimilarGames;
