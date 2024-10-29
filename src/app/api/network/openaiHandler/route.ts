// src/app/api/network/openaiHandler/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // 環境変数からAPIキーを取得
});

export async function POST(req: NextRequest) {
  const { userQuestion } = await req.json();

  const requestFormat = `
    必ず以下のフォーマットに従って返答してください:「O S W P L H G1 G2 ...」
    - 「O」は 1=オンライン, 2=オフライン, 3=両方対応, 該当なしは -1
    - 「S」は 1=シングルプレイヤー, 2=マルチプレイヤー, 3=両方対応, 該当なしは -1
    - 「W」は 1=Windows, 2=Mac, 3=両方対応, 該当なしは -1
    - 「P」は話題性レベル（1~5）、該当なしは -1
    - 「L」と「H」は金額帯の下限と上限、該当なしは -1
    - 「G1 G2 ...」はタグで、複数ある場合は末尾に追加、該当なしは -1

    形式以外の単語や説明文を含めず、完全にこのフォーマットに従って出力してください。例えば、「1 2 1 -1 -1 -1 FPS PvP チーム制」。

    以下のタグリストを使用し、該当するタグのみを「G1 G2 ...」の位置に追加してください。該当がない場合、-1を使用してください。

    タグリスト:
    リアル, アクション, ストラテジー, シューティング, マルチプレイヤー, ファーストパーソン, 3D, eスポーツ, FPS, PvP, チーム制, オンライン協力プレイ, 協力プレイ, 対戦, 戦争, 戦術, 高難易度, サバイバル, バトルロイヤル, キャラクターカスタマイズ, SF, 伝承豊か, 宝探し, 映画的, 無料プレイ, 笑える, ゴア, ホラー, ステルス, サードパーソン, サバイバルホラー, 暴力, 精神的恐怖, 雰囲気, スポーツ, インディー, カジュアル, シミュレーション, サードパーソンシューティング, 早期アクセス, ダーク, スリラー, アドベンチャー, オープンワールド, シングルプレイヤー, アクションアドベンチャー, 選択型進行, 探検, 物語性, かわいい, MOBA, 性的表現, ファンタジー, MMO, MMORPG, PvE, RPG, 良質サントラ, コントローラ, ローカルマルチプレイヤー, 没入シミュレーション, 管理, 資源管理, クラフト, サンドボックス, オープンワールドサバイバルクラフト, アニメ, アーケード, 格闘, VR, 恋愛シミュレーション, パーマデス, 宇宙, エイリアン, コンバット, 2D, 基地建設, 建設, ドット絵, ヌード, ポストアポカリプス, カラフル, ダークファンタジー, ハックアンドスラッシュ, JRPG, アクションRPG, ターン制ストラテジー, パズル, ミステリー, 超自然, プラットフォーム, リラックス, 経済, 女性主人公, 感動的, クラス制, ダンジョンクロウル, マルチエンディング, リプレイ性, 家族向け
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
