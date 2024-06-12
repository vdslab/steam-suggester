'use client';
import Headline from "../common/Headline"
import StackedAreaChart from "./StackedAreaChart"
import getTopGames from "@/hooks/getTopGames";

const excludeOverlap = () => {

  const { data, error, isLoading} = getTopGames()
  console.log(data);

  return (
    <div>

      
    </div>
  )
}

export default excludeOverlap
