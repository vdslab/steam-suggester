export type SteamReviewHistogramApiType = {
  success: number;
  results: {
    start_date: number;
    end_date: number;
    weeks: [];
    rollups: RollupType[];
    rollup_tyype: string;
    recent: RollupType[]
  };
  count_all_reviews: boolean;
  expand_graph: boolean;
}

export type RollupType = {
  date: number;
  recommendations_up: number;
  recommendations_down: number;
}

export type GetSteamAllReviewsResponse = {
  date: string;
  count: number;
  positiveCount: number;
  negativeCount: number;
}