'use client';
import Headline from "../common/Headline";
import DisplayGame from "./DisplayGame";
import useGameDetails from "@/hooks/similarGames/useGameDetails";
import { GameDetails } from "@/types/similarGames/GameDetails";

const SimilarGames = () => {

  const { data, error, isLoading } = useGameDetails();
  if (!data) return <div>loading...</div>

  return (
    <div className=" ">
      <Headline txt="類似してるゲーム" />
      {data.map((game:GameDetails) => (
        <DisplayGame key={game.url} name={game.name} image={game.image} url={game.url}/>
      ))}
    </div>
  )
}

export default SimilarGames

