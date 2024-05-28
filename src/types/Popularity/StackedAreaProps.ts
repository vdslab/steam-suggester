import { CountSteamReviews } from "./CountSteamReviews";

export type StackedAreasProps = {
  data1: CountSteamReviews[],
  width: number;
  height: number;
  events?: boolean;
  margin?: { top: number; right: number; bottom: number; left: number };
};