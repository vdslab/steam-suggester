'use client';

import React, { useEffect, useState } from 'react';
import useGetSteamGameDetail from '@/hooks/popularity/useGetSteamGameDetail';
import MatchIndicator from './MatchIndicator';
import Headline from '../common/Headline';

const Match = () => {
  const [gameTitle, setGameTitle] = useState<string>('');
  const [gameId, setGameId] = useState<number>(0);
  const { data: gameData, error: gameError, isLoading: gameLoading } = useGetSteamGameDetail(gameId || 0);
  

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
