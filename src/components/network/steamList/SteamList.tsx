"use client";

import { SteamListProps } from '@/types/Props';
import OwnedGames from './OwnedGames';
import { SessionProvider } from 'next-auth/react';

const SteamList = (props:SteamListProps) => {
  return (
    <SessionProvider><OwnedGames {...props} /></SessionProvider>
  );
};

export default SteamList;