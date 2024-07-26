import createNetwork from "@/hooks/createNetwork";
import Headline from "../common/Headline";
import DisplayGame from "./DisplayGame";
import { DetailsPropsType, SimilarGamePropsType } from "@/types/DetailsType";

const SimilarGames = async (props: DetailsPropsType) => {
  const { steamGameId } = props;

  const { similarGames } = await createNetwork();

  const data: SimilarGamePropsType[] = [];

  if(similarGames[steamGameId]) {
    for(let i = 0; i < similarGames[steamGameId].length; i++) {
      const res = await fetch(`${process.env.NEXT_PUBLIC_CURRENT_URL}/api/details/getSteamGameDetail/${similarGames[steamGameId][i].steamGameId}`)
      const d = await res.json();
      data.push({
        ...d, 
        steamGameId: similarGames[steamGameId][i].steamGameId,
        twitchGameId: similarGames[steamGameId][i].twitchGameId
      });
    }
  }

  return (
    <div>
      <Headline txt="類似してるゲーム" />
      {data.map((game: SimilarGamePropsType) => (
        <DisplayGame key={game.url} name={game.name} image={game.image} url={game.url} steamGameId={game.steamGameId} twitchGameId={game.twitchGameId} />
      ))}
    </div>
  )
}

export default SimilarGames

