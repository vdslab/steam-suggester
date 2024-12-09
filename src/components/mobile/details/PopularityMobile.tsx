import Headline from "@/components/common/Headline";
import StackedAreaChart from "@/components/popularity/StackedAreaChart";
import { ISR_FETCH_INTERVAL } from "@/constants/DetailsConstants";
import { STEAM_COLOR_RANGE, TWITCH_COLOR_RANGE } from "@/constants/STYLES";

type Props = {
  twitchGameId: string;
  steamGameId: string;
}



const PopularityMobile = async(props:Props) => {

  const { twitchGameId, steamGameId } = props;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_CURRENT_URL}/api/details/countRecentSteamReviews/${steamGameId}`,
    {next: { revalidate: ISR_FETCH_INTERVAL }}
  );
  const steamData = await response.json();

  const res = await fetch(`${process.env.NEXT_PUBLIC_CURRENT_URL}/api/details/getTwitchViews/${twitchGameId}`,
    {next: { revalidate: ISR_FETCH_INTERVAL}}
  );
  const twitchData = await res.json();

  return (
    <div>
      <Headline txt="流行度" />
      {steamData && twitchData ? (
        <div className="flex-col">
          <div className="border border-gray-500 p-2 mb-3">
            <div className="text-white pb-3">Steamレビュー数</div>
            <StackedAreaChart
              data={steamData}
              width={250}
              height={150}
              colorRange={STEAM_COLOR_RANGE}
              labelTxt={{ bottom:'レビュー日（月/日）', left:'レビュー数（件）' }}
            />
          </div>
          <div className="border border-gray-500 p-3">
            <div className="text-white pb-3">Twitch視聴数</div>
            <StackedAreaChart
              data={twitchData}
              width={250}
              height={150}
              colorRange={TWITCH_COLOR_RANGE}
              labelTxt={{ bottom: "視聴日（月/日）", left: "視聴数（人）"}} 
            />
          </div>
        </div>
      ) : null}
      
    </div>
  )
}

export default PopularityMobile