'use client';

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { ISR_FETCH_INTERVAL } from "@/constants/DetailsConstants";
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import Panel from "../Panel";
import Section from "../Section";

type GetFriendGamesResponse = {
  friendsName: string[];
  gameName: string;
};

const OwnedGames = () => {
  const { data: session, status } = useSession();
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
    <Panel title="Steamゲーム一覧" icon={<SportsEsportsIcon className="mr-2 text-white" />}>
      {status === 'authenticated' ? (
        <div>
          {/* 自分の所有ゲーム */}
          <Section title="自分の所有ゲーム" icon={<PersonIcon />}>
            <div className="bg-gray-700 p-2 rounded-lg overflow-y-auto">
              {myOwnGames.map((game: string) => (
                <div key={game} className="p-2 mb-2 bg-gray-900 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="text-white p-2">
                        {game}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* フレンドの所有ゲーム */}
          <Section title="フレンドの所有ゲーム" icon={<GroupIcon />}>
            <div className="bg-gray-700 p-2 rounded-lg overflow-y-auto">
              {friendsOwnGames.map((game, index) => (
                <div key={index} className="p-2 mb-2 bg-gray-900 rounded-lg relative group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="text-white p-2">
                        {game.gameName}
                      </div>
                    </div>
                  </div>
                  {/* ホバー時に表示されるリスト */}
                  <div
                    className="absolute left-1/2 w-64 top-full mt-2 -translate-x-1/2 bg-black text-white p-4 rounded shadow-lg z-50 hidden group-hover:block opacity-0 group-hover:opacity-100"
                  >
                    <h4 className="text-lg font-bold mb-2">所持してるフレンドリスト</h4>
                    <ul>
                      {game.friendsName.map((friend, friendIndex) => (
                        <li key={friendIndex} className="text-sm">{friend}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>
      ) : null}
    </Panel>
  );
};

export default OwnedGames;
