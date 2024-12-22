import SteamProvider, { PROVIDER_ID } from 'next-auth-steam'

import type { AuthOptions } from 'next-auth'
import type { NextRequest } from 'next/server'

export function getAuthOptions(req?: NextRequest): AuthOptions {

  return {
    providers: req
      ? [
          SteamProvider(req, {
            clientSecret: process.env.STEAM_API_KEY || '',
            callbackUrl: `${process.env.NEXT_PUBLIC_CURRENT_URL}/api/auth/callback`
          })
        ]
      : [],
    callbacks: {
      jwt({ token, account, profile }) {
        if (account?.provider === PROVIDER_ID) {
          token.steam = profile
        }
        return token
      },
      session({ session, token }) {
        if ('steam' in token) {
          // @ts-expect-error
          session.user.steam = token.steam
        }
        return session
      }
    }
  }
}