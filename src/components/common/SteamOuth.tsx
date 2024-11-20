'use client'

import { getSession, signIn, signOut } from 'next-auth/react'


export const SteamOuth = async() => {
  const session = await getSession()


  return (
    <div>
      <button onClick={() => signIn()}>Steamでログイン</button>
    </div>
  )
}
