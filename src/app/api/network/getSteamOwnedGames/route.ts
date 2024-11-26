import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {

  const searchParams = req.nextUrl.searchParams;
  const steamId = searchParams.get('steamId');
  const apiKey = process.env.STEAM_API_KEY;

  console.log('STEAM_API_KEY:', apiKey);

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Steam API Key is required' }), { status: 500 });
  }

  if (!steamId) {
    return new Response(JSON.stringify({ error: 'Steam ID is required' }), { status: 400 });
  }

  try {
    const friendsResponse = await fetch(`http://api.steampowered.com/IPlayerService/GetOwnedGames/v1?key=${apiKey}&steamId=${steamId}`);
    const data = await friendsResponse.json();

    return NextResponse.json(data.response);
  } catch (error) {
    console.error(error);
    return new NextResponse(JSON.stringify({ error: 'Failed to fetch friends games' }), { status: 500 });
  }
}
