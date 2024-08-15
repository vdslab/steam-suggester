"use client";

import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import { ISR_FETCH_INTERVAL } from "@/constants/DetailsConstants";
import { changeGameIdData, getGameIdData } from "@/hooks/indexedDB";
import { NodeType, SteamListType } from "@/types/NetworkType";
import { useEffect, useState } from "react";

type Props = {
  nodes: NodeType[];
  setCenterX: React.Dispatch<React.SetStateAction<number>>;
  setCenterY: React.Dispatch<React.SetStateAction<number>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

const GameList = (props: Props) => {
  const { nodes, setCenterX, setCenterY, setIsLoading } = props;

  const [hoveredGameIdx, setHoveredGameIdx] = useState<number>(-1);
  const [steamList, setSteamList] = useState<SteamListType[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredSteamList, setFilteredSteamList] = useState<SteamListType[]>([]);
  const [userAddedGames, setUserAddedGames] = useState<string[]>([]);

  const handleGameClick = (index: number) => {
    setCenterX(nodes[index].x ?? 0);
    setCenterY(nodes[index].y ?? 0);
  };

  const handleGameDelete = (steamGameId: string) => {
    const newUserAddedGames = userAddedGames.filter((gameId: string) => gameId !== steamGameId);
    setUserAddedGames(newUserAddedGames);
    changeGameIdData(newUserAddedGames);
    setIsLoading(true);
  }

  const handleSearchClick = (steamGameId: string) => {
    if (!userAddedGames.includes(steamGameId)) {
      const newUserAddedGames = [...userAddedGames, steamGameId];
      setUserAddedGames(newUserAddedGames);
      changeGameIdData(newUserAddedGames);
      setIsLoading(true);
    }
  };

  useEffect(() => {
    (async () => {
      const res1 = await fetch(
        `${process.env.NEXT_PUBLIC_CURRENT_URL}/api/network/getSteamList`,
        { next: { revalidate: ISR_FETCH_INTERVAL } }
      );
      if (!res1) {
        return {};
      }
      const data = await res1.json();
      const res2 = await getGameIdData();

      setSteamList(data);
      setFilteredSteamList(data);
      setUserAddedGames(res2 ?? []);
    })();
  }, []);

  useEffect(() => {
    if (searchQuery === '') {
      setFilteredSteamList(steamList);
    } else {
      const filteredList = steamList
        .filter((game) =>
          game.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .filter((game) => !userAddedGames.find((gameId: string) => gameId === game.steamGameId));
      setFilteredSteamList(filteredList);
    }
  }, [searchQuery, steamList]);

  return (
    <div style={{ maxHeight: '92vh', overflowY: 'auto', paddingBottom: '120px' }}>
      <input
        type="text"
        placeholder="Search for a game title"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full p-2 mb-2 text-black"
      />
      {searchQuery !== '' && (
        <div className="bg-gray-800 p-2 rounded-lg mb-4">
          <h2 className="text-white mb-2">Search Results</h2>
          {filteredSteamList.map((game, index) => (
            <div className='flex pb-2 justify-between items-center' key={game.steamGameId}>
              <div className="text-white p-2 rounded">
                {game.title}
              </div>
              <PlaylistAddIcon
                className='cursor-pointer hover:bg-gray-700 rounded'
                onClick={() => handleSearchClick(game.steamGameId)}
              />
          </div>
          ))}
        </div>
      )}
      <div className="bg-gray-800 p-2 rounded-lg mb-4">
        <h2 className="text-white mb-2">User Added Games</h2>
        {userAddedGames.map((gameId, index) => {
          const game = steamList.find(game => game.steamGameId === gameId);
          return game ? (
            <div className='flex pb-2 justify-between items-center' key={game.steamGameId}>
              <div className="text-white p-2 rounded">
                {game.title}
              </div>
              <DeleteIcon 
                className='cursor-pointer hover:bg-gray-700 rounded'
                onClick={() => handleGameDelete(game.steamGameId)}
              />
            </div>
          ) : null;
        })}
      </div>
      <h2 className="text-white mb-2">Network Nodes</h2>
      {nodes.map((node: NodeType, index: number) => {
        const isUserAdded = userAddedGames.find((gameId: string) => gameId === node.steamGameId);
        const rankColor = index === 0 
                        ? "gold" 
                        : index === 1 
                        ? "silver" 
                        : index === 2 
                        ? "bronze" 
                        : "text-slate-100";
        const textColor = isUserAdded ? "text-yellow-300" : "text-slate-100";
        return (
          <div className='flex items-center' key={node.index}>
            <div className={`${rankColor} pb-2 p-2`}>
              {index + 1}
            </div>
            <div
              className={`cursor-pointer ${textColor} pb-2 hover:bg-gray-700 p-2 rounded`}
              onMouseEnter={() => setHoveredGameIdx(index)}
              onMouseLeave={() => setHoveredGameIdx(-1)}
              onClick={() => handleGameClick(index)}
              key={index}
            >
              {node.title}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GameList;
