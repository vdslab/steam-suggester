'use client'

import PersonIcon from '@mui/icons-material/Person';
import { signIn, signOut, useSession } from 'next-auth/react';
import { Providers } from './AuthProvider';
import IconButton from '@mui/material/IconButton';
import Image from 'next/image';

const SteamButton = () => {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className='text-sm'>Loading...</div>; // セッション情報をロード中
  }

  if (!session) {
    return (
      <div>
        <IconButton onClick={() => signIn('steam')} sx={{ color: "white" }}>
          <PersonIcon />
        </IconButton>
      </div>
    );
  }

  return (
    <div>
      <IconButton onClick={() => signOut()} sx={{ color: "white"}}>
        {session?.user && session.user.image ? (
          <Image
            src={session.user.image}
            alt="user"
            width={30}
            height={30}
            style={{ borderRadius: '50%' }} // スタイルを追加
          />
        ) : (
          <PersonIcon />
        )}
      </IconButton>
    </div>
  );
}


export const SteamIconButton = () => {
  return (
    <Providers><SteamButton /></Providers>
  )
}