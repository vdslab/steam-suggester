"use client";
import React, { useState, useEffect } from "react";
import { STEAM_COLOR_RANGE, TWITCH_COLOR_RANGE } from "@/constants/STYLES";
import StackedAreaChart from "../popularity/StackedAreaChart";
import CircularProgress from "@mui/material/CircularProgress";

type Props = {
  nodes: any[];
  selectedIndex: number;
};

const Popularity: React.FC<Props> = ({ nodes, selectedIndex }) => {
  const [steamData, setSteamData] = useState<any>(null);
  const [twitchData, setTwitchData] = useState<any>(null);
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
    return (
      <div className="text-white text-center">ゲームが選択されていません。</div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div>
      {steamData && twitchData ? (
        <div className="flex flex-col space-y-4">
          {/* Steamレビュー数 */}
          <div className="border border-gray-500 p-3">
            <div className="text-white pb-3">Steamレビュー数</div>
            <StackedAreaChart
              data={steamData}
              width={600}
              height={300}
              colorRange={STEAM_COLOR_RANGE}
              labelTxt={{
                bottom: "レビュー日（月/日）",
                left: "レビュー数（件）",
              }}
            />
          </div>

          {/* Twitch視聴数 */}
          <div className="border border-gray-500 p-3">
            <div className="text-white pb-3">Twitch視聴数</div>
            <StackedAreaChart
              data={twitchData}
              width={600}
              height={300}
              colorRange={TWITCH_COLOR_RANGE}
              labelTxt={{ bottom: "視聴日（月/日）", left: "視聴数（人）" }}
            />
          </div>
        </div>
      ) : (
        <div className="text-white text-center">データがありません。</div>
      )}
    </div>
  );
};

export default Popularity;
