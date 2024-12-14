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
      <div className="flex flex-col lg:flex-row h-screen overflow-hidden">
        {/* サイドバー */}
        <aside className="w-full lg:w-1/4 bg-stone-950 p-4 overflow-y-auto">
          <SimilarGames steamGameId={steamGameId} twitchGameId={twitchGameId} />
        </aside>
        
        {/* メインコンテンツ */}
        <main className="w-full lg:w-3/4 bg-gray-900 p-6 overflow-y-auto">
          
          {/* ゲームタイトル */}
          <div className="mb-6">
            <GameTitle steamGameId={steamGameId} twitchGameId={twitchGameId} />
          </div>

          {/* ゲーム詳細セクション */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <GameExplanation steamGameId={steamGameId} twitchGameId={twitchGameId} />
            <Match steamGameId={steamGameId} twitchGameId={twitchGameId} />
          </section>

          {/* 人気度と配信者クリップ */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Popularity twitchGameId={twitchGameId} steamGameId={steamGameId}/>
            <DistributorVideos twitchGameId={twitchGameId} steamGameId={steamGameId} />
          </section>

        </main>
      </div>
    </>
  )
}
