// src/app/api/network/openaiHandler/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  // apiKey: process.env.OPENAI_API_KEY,
  apiKey: "",
});

export async function POST(req: NextRequest) {
  const { userQuestion } = await req.json();

  const requestFormat = `
  　　次のフォーマットで出力してください:「L H G1 G2 ...」
      - 「L」「H」: 金額帯の下限と上限、該当なしは -1
      - 「G1 G2 ...」: 該当するタグ、なしは 0で指定

      ユーザーの文章から、関連する要素（L, H, タグ）を判断し、上記フォーマットで出力してください。タグリスト: リアル, アクション, ストラテジー, シューティング, マルチプレイヤー, ファーストパーソン, 3D, eスポーツ, FPS, PvP, チーム制, オンライン協力プレイ, 協力プレイ, 対戦, 戦争, 戦術, 高難易度, サバイバル, バトルロイヤル, キャラクターカスタマイズ, SF, 伝承豊か, 宝探し, 映画的, 無料プレイ, 笑える, ゴア, ホラー, ステルス, サードパーソン, サバイバルホラー, 暴力, 精神的恐怖, 雰囲気, スポーツ, インディー, カジュアル, シミュレーション, サードパーソンシューティング, 早期アクセス, ダーク, スリラー, アドベンチャー, オープンワールド, シングルプレイヤー, アクションアドベンチャー, 選択型進行, 探検, 物語性, かわいい, MOBA, 性的表現, ファンタジー, MMO, MMORPG, PvE, RPG, 良質サントラ, コントローラ, ローカルマルチプレイヤー, 没入シミュレーション, 管理, 資源管理, クラフト, サンドボックス, オープンワールドサバイバルクラフト, アニメ, アーケード, 格闘, VR, 恋愛シミュレーション, パーマデス, 宇宙, エイリアン, コンバット, 2D, 基地建設, 建設, ドット絵, ヌード, ポストアポカリプス, カラフル, ダークファンタジー, ハックアンドスラッシュ, JRPG, アクションRPG, ターン制ストラテジー, パズル, ミステリー, 超自然, プラットフォーム, リラックス, 経済, 女性主人公, 感動的, クラス制, ダンジョンクロウル, マルチエンディング, リプレイ性, 家族向け, Windows, Mac

      指示外の単語や説明は不要です。例:「1000 2000 FPS PvP」
    `;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: requestFormat },
        { role: "user", content: userQuestion }
      ],
      max_tokens: 60,
    });

    const responseText = completion.choices[0].message?.content || "";
    return NextResponse.json({ response: responseText });
  } catch (error) {
    console.error("OpenAI API error:", error);
    return NextResponse.json({ error: "Failed to fetch data from OpenAI API" }, { status: 500 });
  }
}
