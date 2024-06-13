import Match from "@/components/match/Match"
import Popularity from "@/components/popularity/Popularity"
import SimilarGames from "@/components/simlarGames/SimilarGames"
import ExcludeOverlap from "@/components/network/excludeOverlap" //仮

const page = () => {
  return (
    <div className="flex h-screen">
      <div className="w-1/4 bg-gray-100">
        <SimilarGames />
      </div>
      <div className="w-3/4 bg-white flex flex-col p-4">
        <div className="basis-1/10">
          <h2 className="text-xl font-semibold mb-4">ゲームタイトル</h2>
        </div>
        <div className="basis-6/10 flex flex-row space-x-5">
          <div className="basis-1/2">
            <Popularity />
          </div>
          <div className="basis-1/2">
            <Match />
            <ExcludeOverlap/>
          </div>
        </div>
        <div className="basis-3/10 flex flex-col">

        </div>
      </div>
    </div>
  )
}

export default page
