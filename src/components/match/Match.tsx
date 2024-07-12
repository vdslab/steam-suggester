// import getSteamGameDetail from "@/hooks/popularity/useGetSteamGameDetail";
import MatchIndicator from "./MatchIndicator";
import Headline from "../common/Headline";

const Match = async({ steamGameId, twitchGameId }:{ steamGameId: string, twitchGameId: string }) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_CURRENT_URL}/api/getMatchDetails/${steamGameId}/${twitchGameId}`)
  const data = await res.json()

  return (
    <div>
      <Headline txt='フィルター項目との一致度'/>
      {data ? (
        <MatchIndicator data={data}/>
      ) : null}
    </div>
  )
}

export default Match