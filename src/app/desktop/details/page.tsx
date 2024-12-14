/* page.tsx */
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
      <div className="flex flex-col lg:flex-row h-screen">
        {/* サイドバー */}
        <div className="w-full lg:w-1/5 bg-stone-950 p-4 overflow-y-auto">
          <SimilarGames steamGameId={steamGameId} twitchGameId={twitchGameId} />
        </div>
        
        {/* メインコンテンツ */}
        <div className="w-full lg:w-4/5 bg-gray-900 flex flex-col p-4 overflow-y-auto">
          
          {/* 上部セクション: GameTitle と GameExplanation */}
          <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-5 mb-5">
            <div className="lg:w-1/2">
              <GameTitle steamGameId={steamGameId} twitchGameId={twitchGameId} />
              <GameExplanation steamGameId={steamGameId} twitchGameId={twitchGameId} />
            </div>
            <div className="lg:w-1/2">
              <Match steamGameId={steamGameId} twitchGameId={twitchGameId} />
            </div>
          </div>
          
          {/* 下部セクション: Popularity と DistributorVideos */}
          <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-5">
            <div className="lg:w-3/5">
              <Popularity twitchGameId={twitchGameId} steamGameId={steamGameId}/>
            </div>
            <div className="lg:w-2/5">
              <DistributorVideos twitchGameId={twitchGameId} steamGameId={steamGameId} />
            </div>
          </div>
          
        </div>
      </div>
    </> 
  )
}
