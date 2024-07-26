import MatchIndicator from "./MatchIndicator";
import Headline from "../common/Headline";
import { DetailsPropsType } from "@/types/DetailsType";
import { SteamDetailsDataType } from "@/types/api/getSteamDetailType";
import { ISR_FETCH_INTERVAL } from "@/constants/DetailsConstants";
import Link from "next/link";
import FindReplaceIcon from '@mui/icons-material/FindReplace';

const Match = async(props:DetailsPropsType) => {

  const { steamGameId } = props;


  const res = await fetch(
    `${process.env.NEXT_PUBLIC_CURRENT_URL}/api/details/getSteamGameDetail/${steamGameId}`,
    {next: { revalidate:ISR_FETCH_INTERVAL }}
  );
  const data:SteamDetailsDataType = await res.json();

  return (
    <div className="select-none">
      <div className="flex justify-between">
        <Headline txt='ユーザ選択との一致度'/>
        <Link href="/" className="inline-block px-2 py-1 text-white rounded-lg hover:underline">
          <FindReplaceIcon className="text-xl m-2" />
          ユーザ選択を変更する
        </Link>
      </div>

      <MatchIndicator data={data} />
    </div>
  )
}

export default Match
