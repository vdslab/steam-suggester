"use client";

import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import { StreamerListType } from "@/types/NetworkType";
import { useEffect, useState } from "react";

type Props = {
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  streamerIds: StreamerListType[];
  setStreamerIds: React.Dispatch<React.SetStateAction<StreamerListType[]>>;
};

const StreamedList = (props: Props) => {
  const { setIsLoading, streamerIds, setStreamerIds } = props;

  const [streamerList, setStreamerList] = useState<StreamerListType[]>([]);
  const [searchStreamerQuery, setSearchStreamerQuery] = useState<string>('');
  const [filteredStreamerList, setFilteredStreamerList] = useState<StreamerListType[]>([]);

  const handleSearchClick = (twitchUserId: string) => {
    const game = streamerList.find((game) => game.twitchUserId === twitchUserId);

    if (game && !streamerIds.find((addedGame) => addedGame.twitchUserId === twitchUserId)) {
      const newUserAddedGames = [...streamerIds, game];
      setStreamerIds(newUserAddedGames);
      setIsLoading(true);
    }
  };

  const handleGameDelete = (twitchUserId: string) => {
    const updatedUserAddedGames = streamerIds.filter((game) => game.twitchUserId !== twitchUserId);
    setStreamerIds(updatedUserAddedGames);
    setIsLoading(true);
  };

  const data: StreamerListType[] = [
    { name: "Game Title 1", twitchUserId: "512980" }, 
    { name: "Game Title 2", twitchUserId: "30921" },
  ];

  useEffect(() => {
    setStreamerList(data);
    setFilteredStreamerList(data);
  }, []);

  useEffect(() => {
    if (searchStreamerQuery === '') {
      setFilteredStreamerList(streamerList.filter((game) =>
        !streamerIds.some((addedGame) => addedGame.twitchUserId === game.twitchUserId)
      ));
    } else {
      const filteredList = streamerList
        .filter((game) =>
          game.name.toLowerCase().includes(searchStreamerQuery.toLowerCase()) &&
          !streamerIds.some((addedGame) => addedGame.twitchUserId === game.twitchUserId)
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
          {filteredStreamerList.map((game) => (
            <div className="flex pb-2 justify-between items-center" key={game.twitchUserId}>
              <div className="text-white p-2 rounded">
                {game.name} {/* nameを表示 */}
              </div>
              <PlaylistAddIcon
                className="cursor-pointer hover:bg-gray-700 rounded"
                onClick={() => handleSearchClick(game.twitchUserId)}
              />
            </div>
          ))}
        </div>
      )}

      <div className="bg-gray-800 p-2 rounded-lg mb-4">
        <h2 className="text-white mb-2">User Added streamers</h2>
        {streamerIds.map((game) => (
          <div className="flex pb-2 justify-between items-center" key={game.twitchUserId}>
            <div className="text-white p-2 rounded cursor-pointer">
              {game.name}
            </div>
            <DeleteIcon
              className="cursor-pointer hover:bg-gray-700 rounded"
              onClick={() => handleGameDelete(game.twitchUserId)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default StreamedList;
