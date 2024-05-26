import { PopularityType } from "@/types/PopularityType"
import Headline from "../common/Headline"
import StackedAreaChart from "./StackedAreaChart"

const Popularity = (props: PopularityType) => {
  return (
    <div>
      <Headline txt="流行度" />
      <StackedAreaChart width={400} height={300}  />
    </div>
  )
}

export default Popularity
