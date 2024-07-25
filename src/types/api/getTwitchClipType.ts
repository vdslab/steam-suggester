// https://dev.twitch.tv/docs/api/reference/#get-clips
export type TwitchClipApiType = {
  data: TwitchClipDataType[];
  pagination: {
    cursor: string;
  };
};

export type TwitchClipDataType = {
  "id": string;
  "url": string;
  "embed_url": string;
  "broadcaster_id": string;
  "broadcaster_name": string;
  "creator_id": string;
  "creator_name": string;
  "video_id": string;
  "game_id": string;
  "language": string;
  "title": string;
  "view_count": number;
  "created_at": string;
  "thumbnail_url": string;
  "duration": number;
  "vod_offset": null;
  "is_featured": boolean;
};

export type TwitchClipType = {
  id: string;
  url: string;
  embedUrl: string;
  image: string;
  title: string;
};

export type TwitchViews = {
  get_date: string;
  total_views: number;
}