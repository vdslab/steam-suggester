export type SteamDetailsDataType = {
  twitchGameId: string;
  steamGameId: string;
  totalViews?: number;
  title: string;
  genres: string[];
  price: number;
  isSinglePlayer: boolean;
  isMultiPlayer: boolean;
  device: SteamDeviceType;
  imgURL: string;
  url: string;
  tags: string[];
  // 追加
  shortDetails: string;
  releaseDate: string;
  developerName: string;
  salePrice: string;
  playTime: string;
  review: {
    "name": string,
    "score": number,
    "tfidf": number,
   }[];
  difficulty: number;
  graphics: number;
  story: number;
  music: number;

  similarGames: string[];
  featureVector: number[];
}

export type SteamDetailApiType = {
  type: string;
  name: string;
  steamAppId: number;
  requiredAge: number;
  is_free: boolean;
  dlc: number[];
  detailed_description: string;
  about_the_game: string;
  short_description: string;
  supported_languages: string;
  reviews: string;
  header_image: string;
  capsule_image: string;
  capsule_imagev5: string;
  website: string;
  pc_requirements: SteamPcRequestType;
  mac_requirements: SteamPcRequestType;
  linux_requirements: SteamPcRequestType;
  developers: string[];
  publishers: string[];
  price_overview: SteamPriceOverviewType;
  packages: number[];
  package_groups: SteamPackageGroupType[];
  platforms: SteamDeviceType;
  metacritic: SteamMetacriticType;
  categories: SteamCategoryType[];
  genres: string[];
  screenshots: SteamScreenshotType[];
  movies: SteamMoviesType[];
  recommendations: {
    total: number;
  };
  achievements: SteamAchievementType;
  release_date: SteamReleaseDateType;
  support_info: SteamSupportInfoType;
  background: string;
  background_content: string;
  content_descriptors: SteamContentDescriptorType;
  ratings: SteamRatingType[];
};

export type SteamCategoryType = {
  id: number,
  description: string
}

export type SteamDeviceType = {
  windows: boolean,
  mac: boolean,
  linux?: boolean
}

export type SteamPackageGroupType = {
  name: string,
  title: string,
  description: string,
  selection_text: string,
  save_text: string,
  display_type: number,
  is_recurring_subscription: string,
  subs: {
    packageid: number,
    percent_savings_text: string,
    percent_savings: number,
    option_text: string,
    option_description: string,
    can_get_free_license: string,
    is_free_license: boolean,
    price_in_cents_with_discount: number
  }[]
}

export type SteamPriceOverviewType = {
  currency: string,
  initial: number,
  final: number,
  discount_percent: number
}




// 使用してない型
type SteamPcRequestType = {
  minimum: string,
  recommended: string
}
type SteamMetacriticType = {
  score: number,
  url: string
}
type SteamScreenshotType = {
  id: number,
  path_thumbnail: string,
  path_full: string
}
type SteamMoviesType = {
  id: number,
  name: string,
  thumbnail: string,
  webm: {
    "480": string,
    max: string
  },
  highlight: boolean
}
type SteamAchievementType = {
  total: number,
  highlighted: {
    name: string,
    path: string
  }[]
}
type SteamReleaseDateType = {
  coming_soon: boolean,
  date: string
}
type SteamSupportInfoType = {
  url: string,
  email: string
}
type SteamContentDescriptorType = {
  ids: number[],
  notes: string
}
type SteamRatingType = {
  id: number,
  percent: number
}