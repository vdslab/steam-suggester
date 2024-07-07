import { PG_POOL } from '@/constants/PG_POOL';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const client = await PG_POOL.connect();
    const result = await client.query(
      'SELECT token FROM access_token WHERE client_id = $1 ORDER BY get_date DESC LIMIT 1',
      [process.env.TWITCH_CLIENT_ID]
    );

    await client.release(true);

    if (result.rows.length > 0) {
      return NextResponse.json(result.rows[0].token);
    } else {
      return NextResponse.json({ error: 'No access token found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error fetching access token:', error);
    return NextResponse.json({ error: 'Failed to fetch access token' }, { status: 500 });
  }
}