import { DistributorVideos } from "@/components/distributorVideos/DistributorVideos"
import Match from "@/components/match/Match"
import Popularity from "@/components/popularity/Popularity"
import SimilarGames from "@/components/simlarGames/SimilarGames"
import VideoList from "@/components/videoList/VideoList"

export default function Page({
  params
}: {
  params: { game :string }
}){

  const game = params.game


  return (
    <div className="flex h-[92dvh]">
      <div className="w-1/4 bg-[#1b2838]">
        <SimilarGames />
      </div>
      <div className="w-3/4 bg-[#2a475e] flex flex-col p-4">
        <div className="basis-1/10">
          <h2 className="text-xl font-semibold mb-4">ゲームタイトル</h2>
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

