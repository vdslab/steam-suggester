import Headline from "../common/Headline"
import StackedAreaChart from "./StackedAreaChart"

const Popularity = async() => {

  const response = await fetch(`${process.env.CURRENT_URL}/api/popularity/countSteamReviews/1172470`);
  const data = await response.json();

  return (
    <div>
      <Headline txt="流行度" />
      {data ? (
        <StackedAreaChart data={data} width={400} height={270}  />
      ) : null}
      
    </div>
  )
}

export default Popularity
