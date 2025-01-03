"use client";
import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { STEAM_COLOR_RANGE, TWITCH_COLOR_RANGE } from "@/constants/STYLES";
import CircularProgress from "@mui/material/CircularProgress";

type Props = {
  nodes: any[];
  selectedIndex: number;
};

const Popularity: React.FC<Props> = ({ nodes, selectedIndex }) => {
  const [steamData, setSteamData] = useState<any[]>([]);
  const [twitchData, setTwitchData] = useState<any[]>([]);
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
        const steamRes = await fetch(
          `${process.env.NEXT_PUBLIC_CURRENT_URL}/api/details/countRecentSteamReviews/${selectedNode.steamGameId}`
        );
        if (!steamRes.ok) throw new Error("Steamデータの取得に失敗しました。");
        const steamJson = await steamRes.json();
        setSteamData(steamJson);

        const twitchRes = await fetch(
          `${process.env.NEXT_PUBLIC_CURRENT_URL}/api/details/getTwitchViews/${selectedNode.twitchGameId}`
        );
        if (!twitchRes.ok)
          throw new Error("Twitchデータの取得に失敗しました。");
        const twitchJson = await twitchRes.json();
        setTwitchData(twitchJson);
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
    return null;
    // <div className="text-white text-center">ゲームが選択されていません。</div>
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

  // 最新のレビュー数を取得
  const getLatestCount = (data: any[]) => {
    if (data.length === 0) return 0;
    return data[data.length - 1].count;
  };

  // 前日比を計算（数値を返すように修正）
  const getPercentageChange = (data: any[]): number | null => {
    if (data.length < 2) return null;
    const latest = data[data.length - 1].count;
    const previous = data[data.length - 2].count;
    if (previous === 0) return null;
    const change = ((latest - previous) / previous) * 100;
    return Number(change.toFixed(2));
  };

  const latestSteamReviewCount = getLatestCount(steamData);
  const latestTwitchViewCount = getLatestCount(twitchData);

  const steamPercentageChange = getPercentageChange(steamData);
  const twitchPercentageChange = getPercentageChange(twitchData);

  // ダミーデータを追加
  const addDummyData = (data: any[]) => {
    if (data.length === 0) return data;
    const lastData = data[data.length - 1];
    const newDate = new Date(lastData.date);
    newDate.setDate(newDate.getDate() + 1);
    return [
      ...data,
      { date: newDate.toISOString().split("T")[0], count: lastData.count },
    ];
  };

  const steamChartData = addDummyData(steamData);
  const twitchChartData = addDummyData(twitchData);

  return (
    <div className="flex flex-col space-y-2">
      {/* Steamレビュー数 */}
      <div className="relative border border-gray-500 p-2 rounded-md shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-gray-800 flex items-center">
        <ResponsiveContainer width="25%" height={50}>
          <LineChart data={steamChartData}>
            <XAxis dataKey="date" hide />
            <YAxis hide />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="count"
              stroke={STEAM_COLOR_RANGE[0]}
              strokeWidth={2}
              dot={false}
              opacity={0.7}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex-1 flex items-center justify-between ml-4 text-sm text-white">
          <div className="font-medium">Steamレビュー数:</div>
          <div className="font-semibold">{latestSteamReviewCount} 件</div>
          {steamPercentageChange !== null && (
            <div
              className={`ml-2 ${
                steamPercentageChange >= 0 ? "text-green-500" : "text-red-500"
              } flex items-center`}
            >
              {steamPercentageChange >= 0 ? "▲" : "▼"}{" "}
              {Math.abs(steamPercentageChange)}%
            </div>
          )}
        </div>
      </div>

      {/* Twitch視聴数 */}
      <div className="relative border border-gray-500 p-2 rounded-md shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-gray-800 flex items-center">
        <ResponsiveContainer width="25%" height={50}>
          <LineChart data={twitchChartData}>
            <XAxis dataKey="date" hide />
            <YAxis hide />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="count"
              stroke={TWITCH_COLOR_RANGE[0]}
              strokeWidth={2}
              dot={false}
              opacity={0.7}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex-1 flex items-center justify-between ml-4 text-sm text-white">
          <div className="font-medium">Twitch視聴数:</div>
          <div className="font-semibold">{latestTwitchViewCount} 人</div>
          {twitchPercentageChange !== null && (
            <div
              className={`ml-2 ${
                twitchPercentageChange >= 0 ? "text-green-500" : "text-red-500"
              } flex items-center`}
            >
              {twitchPercentageChange >= 0 ? "▲" : "▼"}{" "}
              {Math.abs(twitchPercentageChange)}%
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Popularity;
