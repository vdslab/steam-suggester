'use client';
import { useState, useEffect } from 'react';
import getConvertNameTSteamGameId from "@/hooks/useConvertSteamGameIdListFromGameName";
import getSteamGameDetail from "@/hooks/popularity/useGetSteamGameDetail";

const useConvertNameTSteamGameId = () => {
  const [gameDetails, setGameDetails] = useState<any[]>([]);
  const [error, setError] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGameDetails = async () => {
      try {
        const { data, error } = await getConvertNameTSteamGameId();
        if (error) {
          setError(error);
          setIsLoading(false);
          return;
        }
        console.log(data);
        const detailsArray = [];
        for (const game of data) {
          const details = await getSteamGameDetail(game.id);
          detailsArray.push(details);
        }
        setGameDetails(detailsArray);
        setIsLoading(false);
      } catch (err) {
        setError(err);
        setIsLoading(false);
      }
    };

    fetchGameDetails();
  }, []);

  console.log(gameDetails);
  return { gameDetails, error, isLoading };
};

export default useConvertNameTSteamGameId;
