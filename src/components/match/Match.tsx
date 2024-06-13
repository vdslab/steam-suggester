'use client';

import React, { useEffect, useState } from 'react';
import useGetSteamGameDetail from '@/hooks/popularity/useGetSteamGameDetail';
import useConvertSteamGameIdListFromGameName from '@/hooks/useConvertSteamGameIdListFromGameName';
import MatchIndicator from './MatchIndicator';
import Headline from '../common/Headline';

const Match = () => {
  const [gameTitle, setGameTitle] = useState<string>('');
  const [gameId, setGameId] = useState<number>(0);
  const { data: nameData, error: nameError, isLoading: nameLoading } = useConvertSteamGameIdListFromGameName();
  const { data: gameData, error: gameError, isLoading: gameLoading } = useGetSteamGameDetail(gameId || 0);
  
  useEffect(() => {
    if (nameData && nameData.length > 0) {
      setGameId(nameData[0].id);
      setGameTitle(nameData[0].name);
    }
  }, [nameData]);

  if (nameLoading || gameLoading) return <div>Loading...</div>;
  if (nameError || gameError) return <div>Error occurred</div>;

  return (
    <div>
      <Headline txt="一致度" />
      {gameData ? (
        <MatchIndicator data={gameData} appId={gameId} gameTitle={gameTitle} />
      ) : null}
    </div>
  );
};

export default Match;
