import { NextResponse } from "next/server";
import { PG_POOL } from "@/constants/PG_POOL";
import { GetActiveUserResponse } from "@/types/api/getActiveUserType";

type Params = {
  params: {
    steamGameId: string;
  };
};

export async function GET(req: Request, { params }: Params) {
  const steamGameId = params.steamGameId;

  try {
    const client = await PG_POOL.connect();

    const query = `
      SELECT
        *
      FROM
          steam_active_users
      WHERE
          steam_id = $1
      ORDER BY
          get_date ASC;
    `;

    const result = await client.query(query, [steamGameId]);
    client.release();

    if (result.rows.length === 0) {
      return NextResponse.json([]);
    }

    const activeUsers: GetActiveUserResponse[] = result.rows.map((row) => {
      return {
        get_date: row.get_date,
        active_user: row.active_user,
      };
    });

    const rowsByDate = new Map<number, number>();
    activeUsers.forEach((row) => {
      const dayTs = new Date(row.get_date).setHours(0, 0, 0, 0);
      rowsByDate.set(dayTs, (rowsByDate.get(dayTs) || 0) + row.active_user);
    });
    if (!rowsByDate.size) return NextResponse.json([]);

    // 日付範囲計算
    const timestamps = [...rowsByDate.keys()];
    const minTs = Math.min(...timestamps);
    const maxTs = Math.max(...timestamps);

    const dailyData: GetActiveUserResponse[] = [];
    for (let d = new Date(minTs); d.getTime() <= maxTs; d.setDate(d.getDate() + 1)) {
      const current = d.getTime();
      dailyData.push({
        get_date: Math.floor(current / 1000),
        active_user: rowsByDate.get(current) || 0,
      });
    }

    return NextResponse.json(dailyData);
  } catch (error) {
    console.error("Error fetching game details:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
