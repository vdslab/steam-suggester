"use client";

import { STEAM_COLOR_RANGE, TWITCH_COLOR_RANGE } from "@/constants/STYLES";
import CircularProgress from "@mui/material/CircularProgress";
import { NodeType } from "@/types/NetworkType";
import useSWR from "swr";
import { fetcher } from "../common/Fetcher";
import AreaRechart from "../charts/AreaRechart";

type Props = {
  node: NodeType;
};

const PopularityCharts = ({ node }:Props) => {
  const { data: steamData, error: steamError } = useSWR(
    node
      ? `${process.env.NEXT_PUBLIC_CURRENT_URL}/api/details/countRecentSteamReviews/${node.steamGameId}`
      : null,
    fetcher
  );

  const { data: twitchData, error: twitchError } = useSWR(
    node
      ? `${process.env.NEXT_PUBLIC_CURRENT_URL}/api/details/getTwitchViews/${node.twitchGameId}`
      : null,
    fetcher
  );

  const { data: activeUsersData, error: activeUsersError } = useSWR(
    node
      ? `${process.env.NEXT_PUBLIC_CURRENT_URL}/api/network/getActiveUser/${node.steamGameId}`
      : null,
    fetcher
  );

  if (!node) {
    return (
      <div className="text-white text-center">ゲームが選択されていません。</div>
    );
  }

  if (!steamData || !twitchData || !activeUsersData) {
    return (
      <div className="flex justify-center items-center h-32">
        <CircularProgress />
      </div>
    );
  }

  if (steamError || twitchError || activeUsersError) {
    return (
      <div className="text-red-500 text-center">
        データの取得に失敗しました。
      </div>
    );
  }

  return (
    <div className="flex flex-row overflow-x-auto">
      {/* Steamレビュー数 */}
      <AreaRechart data={steamData} color={STEAM_COLOR_RANGE[0]} title="Steamレビュー数" />

      {/* Twitch視聴数 */}
      <AreaRechart data={twitchData} color={TWITCH_COLOR_RANGE[0]} title="Twitch視聴数" />

      {/* アクティブユーザー数 */}
      <AreaRechart data={activeUsersData} color={STEAM_COLOR_RANGE[0]} title="アクティブユーザー数" />
    </div>
  );
};

export default PopularityCharts;
