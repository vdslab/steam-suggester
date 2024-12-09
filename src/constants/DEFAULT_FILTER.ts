// フィルターの初期値
export const DEFAULT_FILTER = {
  "Genres": {
      "アクション": true,
      "ストラテジー": true,
      "RPG": true,
      "カジュアル": true,
      "レース": true,
      "スポーツ": true,
      "インディー": true,
      "アドベンチャー": true,
      "シミュレーション": true,
      "MMO": true,
      "アニメーション": true,
      "音楽": true,
      "デザイン": true,
      "教育": true,
      "トレーニング": true,
      "開発": true,
      "早期アクセス": true,
      "18＋": true,
      "暴力": true,
      "流血表現": true,
      "ドキュメンタリー": true
  },
  "Price": {
    "startPrice": 0,
    "endPrice": 10000
  },
  "Mode": {
      "isSinglePlayer": true,
      "isMultiPlayer": true
  },
  "Device": {
      "windows": true,
      "mac": true
  },
  "Playtime": {
      "1": true,
      "2": true,
      "3": true,
      "4": true,
      "5": true,
      "6": true,
      "7": true,
      "8": true,
      "9": true,
      "10": true
  }
}

export const DEFAULT_SLIDER = {
  id: "unique_id",
  genreWeight: 50,
  graphicWeight: 50,
  playstyleWeight: 50,
  reviewWeight: 50,
  isDetailMode: false,
  subGenreWeight: 50,
  systemWeight: 50,
  visualWeight: 50,
  worldviewWeight: 50,
  difficultyWeight: 0,
  playtimeWeight: 0,
  priceWeight: 0,
  developerWeight: 0,
  deviceWeight: 0,
  releaseDateWeight: 0
}

// マッピングデータ
export const GENRE_MAPPING = {
  "アクション": "アクション",
  "ストラテジー": "ストラテジー",
  "RPG": "RPG",
  "カジュアル": "カジュアル",
  "レース": "レース",
  "スポーツ": "スポーツ",
  "インディー": "インディー",
  "アドベンチャー": "アドベンチャー",
  "シミュレーション": "シミュレーション",
  "MMO": "MMO",
  "アニメーション": "アニメーション",
  "音楽": "音楽",
  "デザイン": "デザイン",
  "教育": "教育",
  "トレーニング": "トレーニング",
  "開発": "開発",
  "早期アクセス": "早期アクセス",
  "18＋": "18＋",
  "暴力": "暴力",
  "流血表現": "流血表現",
  "ドキュメンタリー": "ドキュメンタリー",
};


// 使用しないフィルター
export const BAN_MAPPING = {
  37: "無料プレイ",
  72: "Nudity",
  50: "Accounting",
  55: "写真編集",
  57: "ユーティリティ",
  58: "Video Production",
  59: "Web publishing",
  84: "Tutorial"
}

export const MODE_MAPPING = {
  isSinglePlayer: "シングルプレイヤー",
  isMultiPlayer: "マルチプレイヤー"
};

export const DEVICE_MAPPING = {
  windows: "windows",
  mac: "mac"
};