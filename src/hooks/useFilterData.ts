import { useState, useEffect } from 'react';
import { getFilterData } from '@/hooks/indexedDB';

export function useFilterData() {
  const [filterData, setFilterData] = useState<{
    genres: string[];
    priceRange: { startPrice: number; endPrice: number };
    modes: string[];
    devices: string[];
    playtimes: string[];
  } | null>(null);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const data = await getFilterData();
        if (data) {
          const genres = Object.keys(data.Genres).filter((genre) => data.Genres[genre]);
          const priceRange = {
            startPrice: data.Price.startPrice,
            endPrice: data.Price.endPrice,
          };
          const modes = [];
          if (data.Mode.isSinglePlayer) modes.push("Single Player");
          if (data.Mode.isMultiPlayer) modes.push("Multiplayer");
          const devices = [];
          if (data.Device.windows) devices.push("Windows");
          if (data.Device.mac) devices.push("Mac");
          const playtimes = Object.keys(data.Playtime).filter((time) => data.Playtime[time]);

          setFilterData({ genres, priceRange, modes, devices, playtimes });
        } else {
          setError("フィルターデータが見つかりませんでした。");
        }
      } catch (err) {
        console.error(err);
        setError("フィルターデータの取得中にエラーが発生しました。");
      }
    };

    fetchFilterData();
  }, []);

  return { filterData, error };
}
