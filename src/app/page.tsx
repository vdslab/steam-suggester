import SimilarGames from "@/components/common/SimilarGames"
import Match from "@/components/match/Match"
import Popularity from "@/components/popularity/Popularity"

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
          </div>
        </div>
        <div className="basis-3/10 flex flex-col">
          <h3 className="text-lg font-semibold mb-2">関連配信者リスト</h3>
          <div className="flex flex-row space-x-5">
            <div className="bg-gray-200 h-24 basis-1/4">動画名</div>
            <div className="bg-gray-200 h-24 basis-1/4">動画名</div>
            <div className="bg-gray-200 h-24 basis-1/4">動画名</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default page
