
import { useState, useEffect } from "react";
import useAllGameData from "./useAllGameData";
import { getGameIdData } from "./indexedDB";
import { SteamDetailsDataType } from "@/types/api/getSteamDetailType";

const useGameData = (isNetworkLoading: boolean) => {
  const [gameIds, setGameIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchGameIds = async () => {
      const ids = (await getGameIdData()) ?? [];
      setGameIds(ids);
    };
    fetchGameIds();
  }, [isNetworkLoading]);

  const allData: SteamDetailsDataType[] | null = useAllGameData(gameIds);

  return { allData };
};

export default useGameData;