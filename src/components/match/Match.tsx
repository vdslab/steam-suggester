'use client';
import { PopularityType } from "@/types/PopularityType"
import getSteamGameDetail from "@/hooks/popularity/useGetSteamGameDetail";
import MatchIndicator from "./MatchIndicator";
// import { GAME_ID } from "@/constants/gameID";

const Match = (props: PopularityType) => {
  // 仮 (検討中)
  const gameTitle="Fall guys";
  const GAME_ID = 438640;

  const { data, error, isLoading} = getSteamGameDetail(GAME_ID)

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">一致度</h3>
      ここはしょうの作成ページです
      {data ? (
        <MatchIndicator data={data} appId={GAME_ID} gameTitle={gameTitle} />
      ) : null}
    </div>
  )
}


export default Match
