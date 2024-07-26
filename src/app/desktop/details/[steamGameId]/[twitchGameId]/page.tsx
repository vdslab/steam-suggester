import GameTitle from "@/components/common/GameTitle"
import DistributorVideos from "@/components/distributorVideos/DistributorVideos"
import GameExplanation from "@/components/GameExplanation/GameExplanation"
import Match from "@/components/match/Match"
import Popularity from "@/components/popularity/Popularity"
import SimilarGames from "@/components/simlarGames/SimilarGames"

export default function Page({
  params
}: {
  params: { steamGameId: string, twitchGameId: string }
}){

  const { steamGameId, twitchGameId } = params;

  return (
    <div className="flex h-[92dvh] ">
      <div className="w-1/4 bg-stone-950">
        <SimilarGames steamGameId={steamGameId} twitchGameId={twitchGameId} />
      </div>
      <div className="w-3/4 bg-gray-900 flex flex-col p-4">
        <div className="basis-6/10 flex flex-row space-x-5">
          <div className="basis-1/2">
            <GameTitle steamGameId={steamGameId} twitchGameId={twitchGameId} />
            <GameExplanation steamGameId={steamGameId} twitchGameId={twitchGameId} />
          </div>
          <div className="basis-1/2">
            <Match steamGameId={steamGameId} twitchGameId={twitchGameId}/>
          </div>
        </div>
        <div className="basis-3/10 flex flex-row space-x-5">
          <div className="basis-2/3">
            <Popularity twitchGameId={twitchGameId} steamGameId={steamGameId}/>
          </div>
          <div className="basis-1/3">
            <DistributorVideos twitchGameId={twitchGameId} steamGameId={steamGameId} />
          </div>
        </div>
      </div>
    </div>
  )
}