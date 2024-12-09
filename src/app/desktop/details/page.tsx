import GameTitle from "@/components/common/GameTitle"
import { DetailsHeader } from "@/components/common/Headers"
import DistributorVideos from "@/components/distributorVideos/DistributorVideos"
import GameExplanation from "@/components/GameExplanation/GameExplanation"
import Match from "@/components/match/Match"
import Popularity from "@/components/popularity/Popularity"
import SimilarGames from "@/components/simlarGames/SimilarGames"

export default function Page({ searchParams }: { searchParams: { steam_id?: string; twitch_id?: string } }) {
  const steamGameId = searchParams.steam_id || "";
  const twitchGameId = searchParams.twitch_id || "";
  return (
    <>
      <DetailsHeader />
      <div className="flex h-[92dvh]">
        <div className="w-1/5 bg-stone-950">
          <SimilarGames steamGameId={steamGameId} twitchGameId={twitchGameId} />
        </div>
        <div className="w-4/5 bg-gray-900 flex flex-col p-4">
          <div className="basis-6/10 flex flex-row space-x-5">
            <div className="basis-1/2 h-[45vh]">
              <GameTitle steamGameId={steamGameId} twitchGameId={twitchGameId} />
              <GameExplanation steamGameId={steamGameId} twitchGameId={twitchGameId} />
            </div>
            <div className="basis-1/2 h-[45vh] select-none">
              <Match steamGameId={steamGameId} twitchGameId={twitchGameId}/>
            </div>
          </div>
          <div className="basis-3/10 flex flex-row space-x-5">
            <div className="basis-3/5 select-none">
              <Popularity twitchGameId={twitchGameId} steamGameId={steamGameId}/>
            </div>
            <div className="basis-2/5">
              <DistributorVideos twitchGameId={twitchGameId} steamGameId={steamGameId} />
            </div>
          </div>
        </div>
      </div>
    </> 
  )
}