"use client";

import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import { StreamerListType } from "@/types/NetworkType";
import { useEffect, useState } from "react";
import { ISR_FETCH_INTERVAL } from "@/constants/DetailsConstants";

type Props = {
  streamerIds: StreamerListType[];
  setStreamerIds: React.Dispatch<React.SetStateAction<StreamerListType[]>>;
};

const StreamedList = (props: Props) => {
  const { streamerIds, setStreamerIds } = props;

  const [streamerList, setStreamerList] = useState<StreamerListType[]>([]);
  const [searchStreamerQuery, setSearchStreamerQuery] = useState<string>('');
  const [filteredStreamerList, setFilteredStreamerList] = useState<StreamerListType[]>([]);

  const handleSearchClick = (twitchGameIds: string[]) => {
    const game = streamerList.find((game) => game.twitchGameId.some((id) => twitchGameIds.includes(id)));

    if (game && !streamerIds.find((addedGame) => addedGame.twitchGameId.some((id) => game.twitchGameId.includes(id)))) {
      const newUserAddedGames = [...streamerIds, game];
      setStreamerIds(newUserAddedGames);
    }
  };

  const handleGameDelete = (twitchGameIds: string[]) => {
    const updatedUserAddedGames = streamerIds.filter((game) =>
      !game.twitchGameId.some((id) => twitchGameIds.includes(id))
    );
    setStreamerIds(updatedUserAddedGames);
  };


  //テスト
  useEffect(() => {
    const fetchData = async () => {
      if (!searchStreamerQuery) return;

      try {
        const encodedUsername = encodeURIComponent(searchStreamerQuery); // フォームの内容をstreamerUsernameにセット

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_CURRENT_URL}/api/details/getTwitchStreamerInf/${encodedUsername}`
        );
        const data = await response.json();
        console.log(data);
        if (Array.isArray(data)) {
          setStreamerList(data);
          setFilteredStreamerList(data);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchData();
  }, [searchStreamerQuery]);


  useEffect(() => {
    if (searchStreamerQuery === '') {
      setFilteredStreamerList(streamerList.filter((game) =>
        !streamerIds.some((addedGame) =>
          addedGame.twitchGameId.some((id) => game.twitchGameId.includes(id))
        )
      ));
    } else {
      const filteredList = streamerList
        .filter((game) =>
          game.name.toLowerCase().includes(searchStreamerQuery.toLowerCase()) &&
          !streamerIds.some((addedGame) =>
            addedGame.twitchGameId.some((id) => game.twitchGameId.includes(id))
          )
        );
      setFilteredStreamerList(filteredList);
    }
  }, [streamerList, searchStreamerQuery, streamerIds]);

  return (
    <div style={{ maxHeight: '92vh', overflowY: 'auto', paddingBottom: '120px' }}>
      <input
        type="text"
        placeholder="Search for streamers"
        value={searchStreamerQuery}
        onChange={(e) => setSearchStreamerQuery(e.target.value)}
        className="w-full p-2 mb-2 text-black"
      />

      {searchStreamerQuery !== '' && (
        <div className="bg-gray-800 p-2 rounded-lg mb-4">
          <h2 className="text-white mb-2">Search Results</h2>
          {filteredStreamerList? filteredStreamerList.map((game) => (
            <div className="flex pb-2 justify-between items-center" key={game.twitchGameId.join(', ')}>
              <div className="text-white p-2 rounded">
                {game.name}
              </div>
              <PlaylistAddIcon
                className="cursor-pointer hover:bg-gray-700 rounded"
                onClick={() => handleSearchClick(game.twitchGameId)}
              />
            </div>
          )):null}
        </div>
      )}

      <div className="bg-gray-800 p-2 rounded-lg mb-4">
        <h2 className="text-white mb-2">User Added streamers</h2>
        {streamerIds.map((game) => (
          <div className="flex pb-2 justify-between items-center" key={game.twitchGameId.join(', ')}>
            <div className="text-white p-2 rounded cursor-pointer">
              {game.name}
            </div>
            <DeleteIcon
              className="cursor-pointer hover:bg-gray-700 rounded"
              onClick={() => handleGameDelete(game.twitchGameId)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default StreamedList;
