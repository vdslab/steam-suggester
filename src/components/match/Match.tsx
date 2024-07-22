import MatchIndicator from "./MatchIndicator";
import Headline from "../common/Headline";

type Props = {
  steamGameId: string;
}

const Match = async(props:Props) => {

  const { steamGameId } = props;


  const res = await fetch(`${process.env.NEXT_PUBLIC_CURRENT_URL}/api/details/getSteamGameDetail/${steamGameId}`);
  const data = await res.json();

  return (
    <div>
      <Headline txt='フィルター項目との一致度'/>
      <MatchIndicator data={data} />
    </div>
  )
}

export default Match
