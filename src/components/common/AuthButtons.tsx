"use client";

import { signIn, signOut, useSession } from 'next-auth/react';

export const SteamAuth = () => {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div>Loading...</div>; // セッション情報をロード中
  }

  if (!session) {
    return (
      <div>
        <button onClick={() => signIn('steam')}>Steamログイン</button>
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => signOut()}>Steamログアウト</button>
    </div>
  );
};
