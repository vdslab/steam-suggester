'use client';
import createNetwork from "@/hooks/createNetwork";
import Headline from "../common/Headline";
import DisplayGame from "./DisplayGame";
import { DetailsPropsType, SimilarGamePropsType } from "@/types/DetailsType";
import { DEFAULT_FILTER } from "@/constants/DEFAULT_FILTER";
import { getFilterData, getGameIdData } from "@/hooks/indexedDB";
import { useEffect, useState } from "react";

type GameType = {
  steamGameId: string;
  twitchGameId: string;
}

const SimilarGames = (props: DetailsPropsType) => {
  const { steamGameId } = props;
  const [data, setData] = useState<SimilarGamePropsType[]>([]);

  useEffect(() => {
    (async () => {
      const filter = await getFilterData() ?? DEFAULT_FILTER;
      const gameIds = await getGameIdData() ?? [];
      const { similarGames } = await createNetwork(filter, gameIds);
      const promises = similarGames[steamGameId].map(async (game: GameType) => {
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
    })();
  }, []);

  return (
    <div>
      <Headline txt="類似してるゲーム" />
      {data.map((game: SimilarGamePropsType) => (
        <DisplayGame key={game.imgURL} title={game.title} imgURL={game.imgURL} steamGameId={game.steamGameId} twitchGameId={game.twitchGameId} />
      ))}
    </div>
  )
}

export default SimilarGames
