'use client';

import { useSession } from "next-auth/react";
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { IconButton } from "@mui/material";
import { useEffect, useState } from "react";
import { ISR_FETCH_INTERVAL } from "@/constants/DetailsConstants";

type GetFriendGamesResponse = {
  friendsName: string[];
  gameName: string;
};

const OwnedGames = () => {
  const { data: session, status } = useSession();
  const [showMenu, setShowMenu] = useState(false);
  const [myOwnGames, setMyOwnGames] = useState<string[]>([]);
  const [friendsOwnGames, setFriendsOwnGames] = useState<GetFriendGamesResponse[]>([]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchData();
    }
  }, [status]);

  const fetchData = async () => {
    if (status !== 'authenticated' || !session?.user?.email) return;

    const email = session.user.email;
    const steamId = email.split('@')[0];

    try {
      const [res1, res2] = await Promise.all([
        fetch(
          `${process.env.NEXT_PUBLIC_CURRENT_URL}/api/network/getSteamOwnedGames?steamId=${steamId}`,
          { next: { revalidate: ISR_FETCH_INTERVAL } }
        ),
        fetch(
          `${process.env.NEXT_PUBLIC_CURRENT_URL}/api/network/getFriendGames?steamId=${steamId}`,
          { next: { revalidate: ISR_FETCH_INTERVAL } }
        ),
      ]);

      const [data1, data2] = await Promise.all([res1.json(), res2.json()]);

      setMyOwnGames(data1);
      setFriendsOwnGames(data2);
    } catch (error) {
      console.error("データ取得中にエラーが発生しました:", error);
    }
  };

  return (
    <div>
      {status === 'authenticated' ? (
        <IconButton onClick={() => setShowMenu(!showMenu)}>
          {!showMenu ? <MenuIcon fontSize="large" sx={{ fill: "white" }} /> : <CloseIcon fontSize="large" sx={{ fill: "white" }} />}
        </IconButton>
      ) : null}

      {showMenu ? (
        <div>
          {/* 自分の所有ゲーム */}
          <div className="p-2">
            <h2 className="text-white">My Owned Games</h2>
          </div>
          <div className="p-2">
            {myOwnGames.map((game: string) => (
              <div key={game} className="p-2 bg-gray-800 rounded-lg mb-2 text-white">
                {game}
              </div>
            ))}
          </div>

          {/* フレンドの所有ゲーム */}
          <div className="p-2">
            <h2 className="text-white">Friends' Owned Games</h2>
          </div>
          <div className="p-2">
            {friendsOwnGames.map((game, index) => (
              <div
                key={index}
                className="relative p-2 bg-gray-800 rounded-lg mb-2 text-white group"
              >
                <div>{game.gameName}</div>
                <div
                  className="absolute left-1/2 top-full mt-2 -translate-x-1/2 bg-black text-white p-4 rounded shadow-lg z-50 hidden group-hover:block min-w-80"
                >
                  <h4 className="text-lg font-bold">所持してるフレンドリスト</h4>
                  <ul>
                    {game.friendsName.map((friend, friendIndex) => (
                      <li key={friendIndex} className="text-sm">{friend}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default OwnedGames;
