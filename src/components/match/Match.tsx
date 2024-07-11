'use client';
import getSteamGameDetail from "@/hooks/popularity/useGetSteamGameDetail";
import MatchIndicator from "./MatchIndicator";
import Headline from "../common/Headline";

const Match = () => {
  // 仮 (検討中)
  const gameTitle="Fall guys";
  const GAME_ID = 438640;

  const { data, error, isLoading} = getSteamGameDetail(GAME_ID)

  return (
    <div>
      <Headline txt='フィルター項目との一致度'/>
      {data ? (
        <MatchIndicator data={data[0]} />
      ) : null}
    </div>
  )
}


export default Match