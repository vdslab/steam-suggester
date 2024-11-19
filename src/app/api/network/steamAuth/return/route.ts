import { NextRequest, NextResponse } from "next/server";
import passport from "passport";
import { Strategy as SteamStrategy } from "passport-steam";

const steamAPIKey = process.env.STEAM_API_KEY!;
const returnURL = process.env.NEXT_PUBLIC_RETURN_URL!;
const realm = process.env.NEXT_PUBLIC_CURRENT_URL!;

passport.use(
  new SteamStrategy(
    {
      returnURL,
      realm,
      apiKey: steamAPIKey,
    },
    (identifier, profile, done) => {
      // ここでSteamからのプロフィール情報を処理
      done(null, profile);
    }
  )
);

// Steamからのリダイレクトを処理
export async function GET(req: NextRequest) {
  return new Promise((resolve, reject) => {
    passport.authenticate("steam", (err, user, info) => {
      if (err) {
        console.error("Steam認証エラー:", err);
        return reject(NextResponse.redirect("/login-failed"));
      }

      if (!user) {
        console.warn("Steam認証失敗");
        return resolve(NextResponse.redirect("/login-failed"));
      }

      // 認証成功 - ユーザー情報を保存またはフロントに渡す
      console.log("Steam認証成功:", user);

      // ユーザーをダッシュボードにリダイレクト
      resolve(
        NextResponse.redirect(`?steamid=${user.id}`)
      );
    })(req);
  });
}
