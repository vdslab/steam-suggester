import { CountSteamReviews } from "./CountSteamReviews";

export type StackedAreasProps = {
  data: CountSteamReviews[],
  width: number;
  height: number;
  labelTxt: { bottom: string; left: string };
  events?: boolean;
  margin?: { top: number; right: number; bottom: number; left: number };
  colorRange: string[];
};