import Headline from "../common/Headline";
import DisplayGame from "./DisplayGame";
import { GameDetails } from "@/types/similarGames/GameDetails";

const SimilarGames = async() => {

  const res = await fetch(`${process.env.NEXT_PUBLIC_CURRENT_URL}/api/similarGames/gameDetails`)
  const data = await res.json()

  return (
    <div>
      <Headline txt="類似してるゲーム" />
      {data.map((game:GameDetails) => (
        <DisplayGame key={game.url} name={game.name} image={game.image} url={game.url}/>
      ))}
    </div>
  )
}

export default SimilarGames

