import TwitchToken from "@/app/api/TwitchToken";
import { NextResponse } from "next/server";
import { TwitchUserDataType, TwitchStreamDataType } from "@/types/api/TwitchTypes";
import { StreamerListType } from "@/types/NetworkType";

type Params = {
  params: {
    twitchUsername: string;
  };
};

export async function GET(req: Request, { params }: Params) {
  const streamerUsername = params.twitchUsername;

  try {
    const token = await TwitchToken();
    if (!token || !process.env.TWITCH_CLIENT_ID) {
      console.error("Missing token or client ID");
      return NextResponse.error();
    }

    const headers = new Headers({
      'Client-ID': process.env.TWITCH_CLIENT_ID,
      'Authorization': `Bearer ${token}`,
    });

    // Fetch user ID based on username
    const userRes = await fetch(`https://api.twitch.tv/helix/users?login=${streamerUsername}`, {
      headers,
    });

    if (!userRes.ok) {
      console.error("Error fetching user data:", userRes.status, await userRes.text());
      return NextResponse.error();
    }

    const userData: { data: TwitchUserDataType[] } = await userRes.json();
    if (userData.data.length === 0) {
      console.error("User not found");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = userData.data[0].id;
    const streamerName = userData.data[0].display_name;

    // Fetch past streams data
    const gamesRes = await fetch(`https://api.twitch.tv/helix/streams?user_id=${userId}`, {//videos streams
      headers,
    });

    if (!gamesRes.ok) {
      console.error("Error fetching stream data:", gamesRes.status, await gamesRes.text());
      return NextResponse.error();
    }

    const gamesData: { data: TwitchStreamDataType[] } = await gamesRes.json();
    const gamesPlayed = new Set<string>();

    gamesData.data.forEach((stream) => {
      if (stream.game_id) {
        gamesPlayed.add(stream.game_id);
      }
    });
    
    const resultGames = Array.from(gamesPlayed);
    const result: StreamerListType[] = [
      {
        name: streamerName,
        twitchGameId: [...resultGames],
      },
    ];

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error fetching user games:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
