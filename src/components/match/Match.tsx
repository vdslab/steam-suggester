import MatchIndicator from "./MatchIndicator";
import Headline from "../common/Headline";
import { DetailsPropsType } from "@/types/DetailsType";
import { SteamDetailsDataType } from "@/types/api/getSteamDetailType";
import { ISR_FETCH_INTERVAL } from "@/constants/DetailsConstants";
import Link from "next/link";

const Match = async(props:DetailsPropsType) => {

  const { steamGameId } = props;


  const res = await fetch(
    `${process.env.NEXT_PUBLIC_CURRENT_URL}/api/details/getSteamGameDetail/${steamGameId}`,
    {next: { revalidate:ISR_FETCH_INTERVAL }}
  );
  const data:SteamDetailsDataType = await res.json();

  return (
    <div>
      <Headline txt='フィルター項目との一致度'/>
      <MatchIndicator data={data} />
      <p className="text-blue-500 text-right">※青はフィルター項目によるもの</p>
      <p className="text-blue-500 text-right">
        <Link href="/" className="inline-block px-2 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors">
          フィルターを変更する
        </Link>
      </p>
    </div>
  )
}

export default Match
