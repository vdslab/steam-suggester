'use client'

import { signIn, signOut } from 'next-auth/react'


export const SteamOuth = () => {


  return (
    <div>
      <button onClick={() => signIn('steam')}>Steamでログイン</button>
    </div>
  )
}
