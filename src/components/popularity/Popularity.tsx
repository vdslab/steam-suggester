'use client';
import { PopularityType } from "@/types/PopularityType"
import Headline from "../common/Headline"
import StackedAreaChart from "./StackedAreaChart"
import useCountSteamReview from "@/hooks/popularity/useCountSteamReviews";
import { GAME_ID } from "@/constants/gameID";

const Popularity = (props: PopularityType) => {

  const { data, error, isLoading} = useCountSteamReview(GAME_ID.id)


  return (
    <div>
      <Headline txt="流行度" />
      {data ? (
        <StackedAreaChart data={data} width={400} height={300}  />
      ) : null}
      
      {/* <button onClick={getData}>steamのレビュー数のデータ取得</button> */}
    </div>
  )
}

export default Popularity
