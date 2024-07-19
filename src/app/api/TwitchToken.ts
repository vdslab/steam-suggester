import { PG_POOL } from "@/constants/PG_POOL";

const TwitchToken = async() => {
  const client = await PG_POOL.connect();
  const result = await client.query(
    'SELECT token FROM access_token WHERE client_id = $1 ORDER BY get_date DESC LIMIT 1',
    [process.env.TWITCH_CLIENT_ID]
  );

  client.release(true);

  if (result.rows.length > 0) {
    return result.rows[0].token;
  } else {
  return { error: 'No access token found' };
  }
}

export default TwitchToken