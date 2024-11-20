import SteamProvider from 'next-auth-steam'
import NextAuth from 'next-auth/next'

import type { NextRequest } from 'next/server'

async function handler(
  req: NextRequest,
  ctx: { params: { nextauth: string[] } }
) {
  return NextAuth(req, ctx, {
    providers: [
      SteamProvider(req, {
        clientSecret: "970E6032D117FC823447B2036CD34E54",
        callbackUrl: 'http://localhost:3000/api/auth/callback'
      })
    ]
  })
}

export {
  handler as GET,
  handler as POST
}