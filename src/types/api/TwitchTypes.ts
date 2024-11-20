export type BaseTwitchDataType = {
    id: string;
    user_id: string;
    user_name: string;
    title: string;
    description?: string;
    thumbnail_url: string;
    view_count: number;
    created_at: string;
    published_at?: string;
    type: string;
};

export type TwitchUserDataType = {
    login: string;
    display_name: string;
    broadcaster_type: string;
    profile_image_url: string;
    offline_image_url: string;
    language?: string;
} & BaseTwitchDataType;
  
export type TwitchStreamDataType = { //ライブ配信
    game_id: string;
    started_at: string;
    language: string;
    tag_ids: string[];
} & BaseTwitchDataType;
  
export type TwitchVideoDataType = { //過去配信
    url: string;
    duration: string;
    muted_segments: any[];
} & BaseTwitchDataType;
  

// export type TwitchUserDataType = {
//     id: string;
//     login: string;
//     display_name: string;
//     type: string;
//     broadcaster_type: string;
//     description: string;
//     profile_image_url: string;
//     offline_image_url: string;
//     view_count: number;
//     created_at: string;
//     thumbnail_url: string;
// };
  
// export type TwitchStreamDataType = {
//     id: string;
//     user_id: string;
//     user_name: string;
//     game_id: string;
//     type: string;
//     title: string;
//     viewer_count: number;
//     started_at: string;
//     language: string;
//     thumbnail_url: string;
//     tag_ids: string[];
// };
  
// export type TwitchVideoDataType = {
//     id: string;
//     user_id: string;
//     user_login: string;
//     user_name: string;
//     title: string;
//     description: string;
//     created_at: string;
//     published_at: string;
//     url: string;
//     thumbnail_url: string;
//     view_count: number;
//     language: string;
//     type: string;
//     duration: string;
//     muted_segments: any[];
//   };