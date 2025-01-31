"use client";
import React, { useState, useEffect } from "react";
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

type Props = {
  nodes: NodeType[];
  selectedIndex: number;
};

const Popularity2: React.FC<Props> = ({ nodes, selectedIndex }) => {
  const [steamData, setSteamData] = useState<any[]>([]);
  const [twitchData, setTwitchData] = useState<any[]>([]);
  const [activeUsersData, setActiveUsersData] = useState<any[]>([]); // アクティブユーザーデータのステート
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selectedNode = nodes[selectedIndex] || null;

  useEffect(() => {
    if (!selectedNode) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        // Steamデータの取得
        const steamRes = await fetch(
          `${process.env.NEXT_PUBLIC_CURRENT_URL}/api/details/countRecentSteamReviews/${selectedNode.steamGameId}`,
          { next: { revalidate: 60 } }
        );
        if (!steamRes.ok) throw new Error("Steamデータの取得に失敗しました。");
        const steamJson = await steamRes.json();
        setSteamData(steamJson);

        // Twitchデータの取得
        const twitchRes = await fetch(
          `${process.env.NEXT_PUBLIC_CURRENT_URL}/api/details/getTwitchViews/${selectedNode.twitchGameId}`,
          { next: { revalidate: 60 } }
        );
        if (!twitchRes.ok)
          throw new Error("Twitchデータの取得に失敗しました。");
        const twitchJson = await twitchRes.json();
        setTwitchData(twitchJson);

        // アクティブユーザーデータの取得
        const activeUsersRes = await fetch(
          `${process.env.NEXT_PUBLIC_CURRENT_URL}/api/network/getActiveUser/${selectedNode.steamGameId}`,
          { next: { revalidate: 60 } }
        );
        if (!activeUsersRes.ok)
          throw new Error("アクティブユーザーデータの取得に失敗しました。");
        const activeUsersJson = await activeUsersRes.json();
        setActiveUsersData(activeUsersJson);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "データの取得中にエラーが発生しました。");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedNode]);

  if (!selectedNode) {
    return (
      <div className="text-white text-center">ゲームが選択されていません。</div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
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
