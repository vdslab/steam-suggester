import GameTitle from "@/components/common/GameTitle";
import { DetailsHeader } from "@/components/common/Headers";
import DistributorVideos from "@/components/distributorVideos/DistributorVideos";
import GameExplanation from "@/components/GameExplanation/GameExplanation";
import Popularity from "@/components/popularity/Popularity";
import SimilarGames from "@/components/simlarGames/SimilarGames";
import UserSelection from '@/components/GameExplanation/UserSelection';
import Typography from '@mui/material/Typography';
import { SteamDetailsDataType } from '@/types/api/getSteamDetailType';


export default async function Page({ searchParams }: { searchParams: { steam_id?: string; twitch_id?: string } }) {
  const steamGameId = searchParams.steam_id || "";
  const twitchGameId = searchParams.twitch_id || "";

  const data = await fetch(`${process.env.NEXT_PUBLIC_CURRENT_URL}/api/details/getSteamGameDetail/${steamGameId}`);
  const steamData:SteamDetailsDataType = await data.json()


  return (
    <div className="bg-gray-800 min-h-screen">
      <DetailsHeader />
      <div className="w-full p-4 max-w-screen-2xl mx-auto">
        {/* ゲームタイトル */}
        <div className="mb-6">
          <GameTitle steamGameId={steamGameId} twitchGameId={twitchGameId} />
        </div>

        {/* メインレイアウト: 3カラム */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 左カラム: UserSelection と MatchDegree */}
          <div className="lg:col-span-2 space-y-6">
            <GameExplanation
              steamGameId={steamGameId}
              steamDetailData={steamData}
            />
            <UserSelection />
          </div>

          {/* 中央カラム: GameExplanation */}
          <div className="lg:col-span-1 space-y-6">
            {/* 流行度 */}
            <div className='bg-gray-700 rounded-lg overflow-hidden border border-gray-400 p-3'>
              <Typography className="text-white font-semibold pb-3 pt-2">流行度</Typography>
              <Popularity twitchGameId={twitchGameId} steamGameId={steamGameId} />
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            {/* 類似しているゲーム */}
            <div className='bg-gray-700 rounded-lg overflow-hidden border border-gray-400 p-3'>
              <Typography className="text-white font-semibold p-3">類似しているゲーム</Typography>
              <SimilarGames steamGameId={steamGameId} twitchGameId={twitchGameId} />
            </div>

            {/* 配信者クリップ */}
            <div className='bg-gray-700 rounded-lg overflow-hidden border border-gray-400 p-3'>
              <Typography className="text-white font-semibold p-3">配信者</Typography>
              <DistributorVideos twitchGameId={twitchGameId} steamGameId={steamGameId} />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
