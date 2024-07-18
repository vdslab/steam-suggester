import { STEAM_COLOR_RANGE, TWITCH_COLOR_RANGE } from "@/constants/STYLES";
import StackedAreaChart from "./StackedAreaChart"
import Headline from "../common/Headline";

type Props = {
  twitchGameId: string;
  steamGameId: string;
}

const Popularity = async(props:Props) => {

  const { twitchGameId, steamGameId } = props;

  const response = await fetch(`${process.env.NEXT_PUBLIC_CURRENT_URL}/api/details/countRecentSteamReviews/${steamGameId}`);
  const steamData = await response.json();

  const res = await fetch(`${process.env.NEXT_PUBLIC_CURRENT_URL}/api/details/getTwitchViews/${twitchGameId}`);
  const twitchData = await res.json();

  return (
    <div>
      <Headline txt="流行度" />
      {steamData && twitchData ? (
        <div className="flex">
          <div className="border border-gray-500 p-3">
            <div className="text-white">Steamレビュー数</div>
            <StackedAreaChart data={steamData} width={300} height={200} colorRange={STEAM_COLOR_RANGE}/>
          </div>
          <div className="border border-gray-500 ml-2 p-3">
            <div className="text-white">Twitch視聴数</div>
            <StackedAreaChart data={twitchData} width={300} height={200} colorRange={TWITCH_COLOR_RANGE} />
          </div>
        </div>
      ) : null}
      
    </div>
  )
}

export default Popularity
