
import { useState, useEffect } from "react";
import useSWR from "swr";
import { SteamDetailsDataType } from "@/types/api/getSteamDetailType";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const useAllGameData = (gameIds: string[]) => {
  const { data: fetchedData } = useSWR(
    `${process.env.NEXT_PUBLIC_CURRENT_URL}/api/network/getMatchGames`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 86400000, // 1日（ミリ秒）
    }
  );

  const missingGameIds = gameIds.filter(
    (id) => !fetchedData?.some((data: SteamDetailsDataType) => data.steamGameId === id)
  );

  const { data: additionalData } = useSWR(
    missingGameIds.length > 0 ? ['getAdditionalData', missingGameIds] : null,
    async () => {
      const promises = missingGameIds.map((gameId) =>
        fetch(
          `${process.env.NEXT_PUBLIC_CURRENT_URL}/api/details/getSteamGameDetail/${gameId}`
        ).then((res) => res.json())
      );
      return await Promise.all(promises);
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 86400000, // 1日（ミリ秒）
    }
  );

  const [allData, setAllData] = useState<SteamDetailsDataType[] | null>(null);

  useEffect(() => {
    if (!fetchedData || (missingGameIds.length > 0 && !additionalData)) return;

    const combinedData = [...fetchedData, ...(additionalData ?? [])];
    setAllData(combinedData);
  }, [fetchedData, additionalData]);

  return allData;
};

export default useAllGameData;