/* components/popularity/Popularity.tsx */
'use client'
import React, { useState, useEffect } from "react";
import { STEAM_COLOR_RANGE, TWITCH_COLOR_RANGE } from "@/constants/STYLES";
import StackedAreaChart from "./StackedAreaChart";
import { ISR_FETCH_INTERVAL } from "@/constants/DetailsConstants";
import CircularProgress from '@mui/material/CircularProgress';

type Props = {
  twitchGameId: string;
  steamGameId: string;
}

const Popularity: React.FC<Props> = ({ twitchGameId, steamGameId }) => {
  const [steamData, setSteamData] = useState<any>(null);
  const [twitchData, setTwitchData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const steamRes = await fetch(
          `${process.env.NEXT_PUBLIC_CURRENT_URL}/api/details/countRecentSteamReviews/${steamGameId}`,
          { next: { revalidate: ISR_FETCH_INTERVAL } }
        );
        if (!steamRes.ok) throw new Error("Steamデータの取得に失敗しました。");
        const steamJson = await steamRes.json();
        setSteamData(steamJson);

        const twitchRes = await fetch(
          `${process.env.NEXT_PUBLIC_CURRENT_URL}/api/details/getTwitchViews/${twitchGameId}`,
          { next: { revalidate: ISR_FETCH_INTERVAL } }
        );
        if (!twitchRes.ok) throw new Error("Twitchデータの取得に失敗しました。");
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
  }, [steamGameId, twitchGameId]);

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
            <div className="w-full">
              <StackedAreaChart
                data={steamData}
                width={600}
                height={300}
                colorRange={STEAM_COLOR_RANGE}
                labelTxt={{ bottom: 'レビュー日（月/日）', left: 'レビュー数（件）' }}
              />
            </div>
          </div>

          {/* Twitch視聴数 */}
          <div className="border border-gray-500 p-3">
            <div className="text-white pb-3">Twitch視聴数</div>
            <div className="w-full">
              <StackedAreaChart
                data={twitchData}
                width={600}
                height={300}
                colorRange={TWITCH_COLOR_RANGE}
                labelTxt={{ bottom: "視聴日（月/日）", left: "視聴数（人）" }} 
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="text-white text-center">データがありません。</div>
      )}
    </div>
  )
}

export default Popularity;
