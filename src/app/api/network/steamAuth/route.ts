import { NextRequest, NextResponse } from "next/server";
import passport from "passport";
import { Strategy as SteamStrategy } from "passport-steam";

const steamAPIKey = process.env.STEAM_API_KEY!;
const returnURL = process.env.NEXT_PUBLIC_RETURN_URL!;
const realm = process.env.NEXT_PUBLIC_CURRENT_URL!;

 console.log(steamAPIKey)

passport.use(
  new SteamStrategy(
    {
      returnURL,
      realm,
      apiKey: steamAPIKey,
    },
    (identifier, profile, done) => {
      done(null, profile);
    }
  )
);

console.log(steamAPIKey)

// セッション管理（省略可）
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

console.log(steamAPIKey)

export async function GET(req: NextRequest) {
  return new Promise((resolve, reject) => {
    passport.authenticate("steam", (err, user, info) => {
      if (err) return reject(err);
      if (!user) return resolve(NextResponse.redirect("/login-failed"));

      // 認証成功後、ユーザー情報（steamidなど）をクッキーに保存
      const response = NextResponse.redirect("/");

      // クッキーにsteamidを保存（httpOnlyオプションでセキュアに保存）
      response.cookies.set("steamid", user.id, {
        path: "/",
        httpOnly: true,
        secure: false, // 本番環境でのみ`secure`を有効にする
        maxAge: 60 * 60 * 24 * 1000 , // 1日の有効期限(ミリ秒)
        sameSite: "lax",
      });

      resolve(response);
    })(req);
  });
}
