'use client';
import Headline from "../common/Headline"
import StackedAreaChart from "./StackedAreaChart"
import useCountSteamReview from "@/hooks/popularity/useCountSteamReviews";

const Popularity = () => {

  const { data, error, isLoading} = useCountSteamReview(271590)


  return (
    <div>
      <Headline txt="流行度" />
      {data ? (
        <StackedAreaChart data={data} width={400} height={300}  />
      ) : null}
      
    </div>
  )
}

export default Popularity
