"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { STEAM_COLOR_RANGE, TWITCH_COLOR_RANGE } from "@/constants/STYLES";
import CircularProgress from "@mui/material/CircularProgress";
import { NodeType } from "@/types/NetworkType";
import useSWR from "swr";
import { fetcher } from "../common/Fetcher";

type Props = {
  nodes: NodeType[];
  selectedIndex: number;
};

const Popularity2: React.FC<Props> = ({ nodes, selectedIndex }) => {
  const selectedNode = nodes[selectedIndex] || null;

  const { data: steamData, error: steamError } = useSWR(
    selectedNode
      ? `${process.env.NEXT_PUBLIC_CURRENT_URL}/api/details/countRecentSteamReviews/${selectedNode.steamGameId}`
      : null,
    fetcher
  );

  const { data: twitchData, error: twitchError } = useSWR(
    selectedNode
      ? `${process.env.NEXT_PUBLIC_CURRENT_URL}/api/details/getTwitchViews/${selectedNode.twitchGameId}`
      : null,
    fetcher
  );

  const { data: activeUsersData, error: activeUsersError } = useSWR(
    selectedNode
      ? `${process.env.NEXT_PUBLIC_CURRENT_URL}/api/network/getActiveUser/${selectedNode.steamGameId}`
      : null,
    fetcher
  );

  if (!selectedNode) {
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
    return <div className="text-red-500 text-center">データの取得に失敗しました。</div>;
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}/${month}/${day}`;
  };

  // ヘルパー関数: データが存在し、最新のカウントが0でないかをチェック
  const hasValidData = (data: any[], key: string) => {
    return data.length > 0 && (data[data.length - 1][key] || 0) > 0;
  };

  return (
    <div className="flex flex-row overflow-x-auto">
      {/* Steamレビュー数 */}
      <div className="flex flex-col items-center border border-gray-500 rounded-md shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-gray-800">
        {hasValidData(steamData, "count") ? (
          <ResponsiveContainer width={100}>
            <AreaChart data={steamData}>
              <XAxis dataKey="date" hide />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  padding: "4px",
                  backgroundColor: "#222",
                  borderRadius: "4px",
                }}
                labelStyle={{ fontSize: "8px", color: "#aaa" }}
                itemStyle={{ fontSize: "8px", color: "#fff" }}
                labelFormatter={(value) => formatDate(value)}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke={STEAM_COLOR_RANGE[0]}
                fill={STEAM_COLOR_RANGE[0]}
                fillOpacity={1}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex-1 flex items-center justify-center text-white h-40">
            データがありません
          </div>
        )}
        <div className="text-white text-center">Steamレビュー数</div>
      </div>

      {/* Twitch視聴数 */}
      <div className="flex flex-col items-center border border-gray-500 rounded-md shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-gray-800">
        {hasValidData(twitchData, "count") ? (
          <ResponsiveContainer width={100}>
            <AreaChart data={twitchData}>
              <XAxis dataKey="date" hide />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  padding: "4px",
                  backgroundColor: "#222",
                  borderRadius: "4px",
                }}
                labelStyle={{ fontSize: "8px", color: "#aaa" }}
                itemStyle={{ fontSize: "8px", color: "#fff" }}
                labelFormatter={(value) => formatDate(value)}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke={TWITCH_COLOR_RANGE[0]}
                fill={TWITCH_COLOR_RANGE[0]}
                fillOpacity={1}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex-1 flex items-center justify-center text-white h-40">
            データがありません
          </div>
        )}
        <div className="text-white text-center">Twitch視聴数</div>
      </div>

      {/* アクティブユーザー数 */}
      <div className="flex flex-col items-center border border-gray-500 rounded-md shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-gray-800">
        {hasValidData(activeUsersData, "active_user") ? (
          <ResponsiveContainer width={100}>
            <AreaChart data={activeUsersData}>
              <XAxis dataKey="date" hide />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  padding: "4px",
                  backgroundColor: "#222",
                  borderRadius: "4px",
                }}
                labelStyle={{ fontSize: "8px", color: "#aaa" }}
                itemStyle={{ fontSize: "8px", color: "#fff" }}
                labelFormatter={(value) => formatDate(value)}
              />
              <Area
                type="monotone"
                dataKey="active_user"
                stroke={STEAM_COLOR_RANGE[0]}
                fill={STEAM_COLOR_RANGE[0]}
                fillOpacity={1}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex-1 flex items-center justify-center text-white h-40">
            データがありません
          </div>
        )}
        <div className="text-white text-center">アクティブユーザー数</div>
      </div>
    </div>
  );
};

export default Popularity2;
