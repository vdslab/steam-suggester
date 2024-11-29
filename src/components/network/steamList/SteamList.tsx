"use client";

import OwnedGames from './OwnedGames';
import { SessionProvider } from 'next-auth/react';

const SteamList = () => {
  return (
    <SessionProvider><OwnedGames /></SessionProvider>
  );
};

export default SteamList;