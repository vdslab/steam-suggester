import Gametitle from "@/components/common/Gametitle"
import DistributorVideos from "@/components/distributorVideos/DistributorVideos"
import Match from "@/components/match/Match"
import Popularity from "@/components/popularity/Popularity"
import SimilarGames from "@/components/simlarGames/SimilarGames"

export default function Page({
  params
}: {
  params: { steamGameId :string }
}){

  const steamGameId = params.steamGameId;

  return (
    <div className="flex h-[92dvh]">
      <div className="w-1/4 bg-[#1b2838]">
        <SimilarGames />
      </div>
      <div className="w-3/4 bg-[#2a475e] flex flex-col p-4">
        <div className="basis-1/10">
          <Gametitle steamGameId={steamGameId} />
        </div>
        <div className="basis-6/10 flex flex-row space-x-5">
          <div className="basis-1/2">
            <Popularity />
          </div>
          <div className="basis-1/2">
            <Match />
          </div>
        </div>
        <div className="basis-3/10 flex flex-col">
          <DistributorVideos />
        </div>
      </div>
    </div>
  )
}

