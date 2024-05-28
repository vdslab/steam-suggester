import { CountSteamReviews } from "@/types/Popularity/CountSteamReviews"

const CalcXDomain = (data: CountSteamReviews[]) : [number, number] => {
  return [
    Math.min(...data.map((d) => d.date)),
    Math.max(...data.map((d) => d.date))
  ]
}

export default CalcXDomain
