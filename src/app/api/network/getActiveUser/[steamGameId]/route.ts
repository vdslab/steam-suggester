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

    const activeUsers:GetActiveUserResponse[] = result.rows.map((row) => {
      return {
        get_date: row.get_date,
        active_user: row.active_user
        };
    });

    return NextResponse.json(activeUsers);
  } catch (error) {
    console.error("Error fetching game details:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
