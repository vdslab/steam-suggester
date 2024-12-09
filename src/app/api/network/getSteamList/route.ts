import { PG_POOL } from "@/constants/PG_POOL";
import { SteamListType } from "@/types/NetworkType";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const query = `
      SELECT steam_game_id, game_title FROM steam_game_data;
    `;

    const { rows } = await PG_POOL.query(query);

    const result: SteamListType[] = rows.map((data) => {
      return {
        steamGameId: data.steam_game_id,
        title: data.game_title
      }
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error("Error fetching top games:", error);
    return NextResponse.error();
  }
}
