import { DetailsHeader, DetailsHeaderMobile } from "@/components/common/Headers"
import DistributorVideos from "@/components/distributorVideos/DistributorVideos"
import Match from "@/components/match/Match"
import GameDescription from "@/components/mobile/details/GameDescription"
import PopularityMobile from "@/components/mobile/details/PopularityMobile"
import SimilarGames from "@/components/simlarGames/SimilarGames"
import { SteamDetailsDataType } from "@/types/api/getSteamDetailType"

export default async function Page({ searchParams }: { searchParams: { steam_id?: string; twitch_id?: string } }) {
  const steamGameId = searchParams.steam_id || "";
  const twitchGameId = searchParams.twitch_id || "";

  const data = await fetch(`${process.env.NEXT_PUBLIC_CURRENT_URL}/api/network/getMatchGames`);
  const steamAllData:SteamDetailsDataType[] = await data.json()

  return (
    <>
      <DetailsHeaderMobile />
      <div className="w-screen bg-gray-900 flex flex-col p-4">
        <GameDescription steamGameId={steamGameId} twitchGameId={twitchGameId} />
        <Match steamGameId={steamGameId} twitchGameId={twitchGameId}/>
        <SimilarGames steamGameId={steamGameId} twitchGameId={twitchGameId} steamAllData={steamAllData}/>

        <PopularityMobile twitchGameId={twitchGameId} steamGameId={steamGameId}/>
        <DistributorVideos twitchGameId={twitchGameId} steamGameId={steamGameId} />

    </div>
    </> 
  )
}