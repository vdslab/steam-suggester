import { CountSteamReviews } from "@/types/Popularity/CountSteamReviews"

const CalcXDomain = (data?: CountSteamReviews[]) : [number, number] => {
  if (!data) {
    return [0, 0]
  }
  return [
    Math.min(...data.map((d) => d.date)),
    Math.max(...data.map((d) => d.date))
  ]
}

export default CalcXDomain
