import { CountSteamReviews } from "./CountSteamReviews";

export type StackedAreasProps = {
  data: CountSteamReviews[],
  width: number;
  height: number;
  events?: boolean;
  margin?: { top: number; right: number; bottom: number; left: number };
};