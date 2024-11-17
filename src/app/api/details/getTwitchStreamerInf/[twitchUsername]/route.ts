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

    // Step 1: Try fetching user data using the Twitch user endpoint
    let userRes = await fetch(`https://api.twitch.tv/helix/users?login=${streamerUsername}`, {
      headers,
    });

    let userData: { data: TwitchUserDataType[] } | null = null;

    if (userRes.ok) {
      userData = await userRes.json();
    }

    // Step 2: If no user data is found, try searching by channel name
    if (!userData || userData.data.length === 0) {
      console.log("User not found by ID, searching by channel name...");
      userRes = await fetch(`https://api.twitch.tv/helix/search/channels?query=${streamerUsername}`, {
        headers,
      });

      if (!userRes.ok) {
        console.error("Error fetching channel search data:", userRes.status, await userRes.text());
        return NextResponse.error();
      }

      userData = await userRes.json();

      if (userData.data.length === 0) {
        console.error("Channel not found");
        return NextResponse.json({ error: "User or channel not found" }, { status: 404 });
      }
    }

    // Step 3: For each of the found channels, fetch stream data
    const result: StreamerListType[] = [];
    for (const channel of userData.data) {
      const streamerName = channel.display_name;
      const userId = channel.id;

      const gamesRes = await fetch(`https://api.twitch.tv/helix/streams?user_id=${userId}`, {
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

      result.push({
        name: streamerName,
        twitchGameId: [...resultGames],
      });
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error fetching user or channel data:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
