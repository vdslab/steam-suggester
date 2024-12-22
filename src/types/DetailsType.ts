// detailsページの各コンポーネントで使用する型を共通化
export type DetailsPropsType = {
  steamGameId: string;
  twitchGameId: string;
}

 // createNetworkの返り値similarGamesのオブジェクト内のvalue
export type SimilarGameValueType = {
  steamGameId: string;
  twitchGameId: string;
}

// 類似ゲームで使用
export type SimilarGamePropsType = {
  title: string;
  imgURL: string;
  steamGameId: string;
  twitchGameId: string;
}

// 流行度グラフで使用
export type CountSteamReviews = {
  date: number;
  count: number;
}

export type StackedAreasProps = {
  data: CountSteamReviews[],
  width: number;
  height: number;
  labelTxt: { bottom: string; left: string };
  events?: boolean;
  margin?: { top: number; right: number; bottom: number; left: number };
  colorRange: string[];
};