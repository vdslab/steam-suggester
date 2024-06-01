'use client';
import { PopularityType } from "@/types/PopularityType"
import getSteamGameDetail from "@/hooks/popularity/useGetSteamGameDetail";
import MatchIndicator from "./MatchIndicator";
import { GAME_ID } from "@/constants/gameID";

const Match = (props: PopularityType) => {
  const gameTitle="Fall guys";
  const appId = "438640";

  const { data, error, isLoading} = getSteamGameDetail(GAME_ID.id)
  console.log(data)
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">一致度</h3>
      ここはしょうの作成ページです
      <MatchIndicator appId={appId} gameTitle={gameTitle} />
    </div>
  )
}


export default Match
