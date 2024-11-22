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

  const [steamList, setSteamList] = useState<SteamListType[]>([]);
  const [searchSteamQuery, setSearchSteamQuery] = useState<string>('');
  const [searchNodesQuery, setSearchNodesQuery] = useState<string>('');
  const [filteredSteamList, setFilteredSteamList] = useState<SteamListType[]>([]);
  const [filteredNodeList, setFilteredNodeList] = useState<NodeType[]>(nodes);
  const [userAddedGames, setUserAddedGames] = useState<string[]>([]);

  const selectColor = (index: number, flag: boolean) => {
    const textColor = flag ? "text-yellow-300" : "text-slate-100";
    const rankColor = index === 0 
                    ? "gold" 
                    : index === 1 
                    ? "silver" 
                    : index === 2 
                    ? "bronze" 
                    : "text-slate-100";
    return { textColor, rankColor };
  }

  const handleGameClick = (index: number) => {
    setCenterX(nodes[index].x ?? 0);
    setCenterY((nodes[index].y ?? 0) + 100);
  };

  const handleGameDelete = (steamGameId: string) => {
    const newUserAddedGames = userAddedGames.filter((gameId: string) => gameId !== steamGameId);
    setUserAddedGames(newUserAddedGames);
    changeGameIdData(newUserAddedGames);
    handleGameClick(0);
    setIsLoading(true);
  }

  const handleSearchClick = (steamGameId: string) => {
    if(!userAddedGames.includes(steamGameId)) {
      const index = filteredNodeList.findIndex((node: NodeType) => node.steamGameId === steamGameId);
      if(index !== -1) handleGameClick(index);
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
      if(!res1) {
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
    if(searchSteamQuery === '') {
      setFilteredSteamList(steamList);
    } else {
      const filteredList = steamList
        .filter((game) =>
          game.title.toLowerCase().includes(searchSteamQuery.toLowerCase())
        )
        .filter((game) => !userAddedGames.find((gameId: string) => gameId === game.steamGameId));
      setFilteredSteamList(filteredList);
    }
  }, [steamList, searchSteamQuery]);

  useEffect(() => {
    if(searchNodesQuery === '') {
      setFilteredNodeList(nodes);
    } else {
      const filteredList = nodes
        .filter((game) =>
          game.title.toLowerCase().includes(searchNodesQuery.toLowerCase())
        )
      setFilteredNodeList(filteredList);
    }
  }, [nodes, searchNodesQuery]);

  return (
    <div style={{ maxHeight: '92vh', overflowY: 'auto', paddingBottom: '120px' }}>
      <input
        type="text"
        placeholder="Search for a game title"
        value={searchSteamQuery}
        onChange={(e) => setSearchSteamQuery(e.target.value)}
        className="w-full p-2 mb-2 text-black"
      />
      {searchSteamQuery !== '' && (
        <div className="bg-gray-800 p-2 rounded-lg mb-4">
          <h2 className="text-white mb-2">Search Results</h2>
          {filteredSteamList.map((game) => (
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
        {userAddedGames.slice().sort((gameId1: string, gameId2: string) => {
            const index1 = nodes.findIndex((node: NodeType) => node.steamGameId === gameId1);
            const index2 = nodes.findIndex((node: NodeType) => node.steamGameId === gameId2);
            if(index1 === -1) return 1;
            if(index2 === -1) return -1;
            return index1 - index2;
          }).map((gameId) => {
          const nodeIndex = nodes.findIndex((node: NodeType) => node.steamGameId === gameId);
          const game = steamList.find(game => game.steamGameId === gameId);
          const isInNodes = nodeIndex >= 0;
          const { textColor, rankColor } = selectColor(nodeIndex, isInNodes);
          return game ? (
            <div className='flex pb-2 justify-between items-center' key={game.steamGameId}>
              <div className='flex items-center'>
                <div className={`${rankColor} pb-2 p-2`}>
                  {nodeIndex >= 0 && nodeIndex + 1}
                </div>
                <div className={`${textColor} p-2 rounded`}>
                  {isInNodes ? <div 
                    className='cursor-pointer'
                    onClick={() => handleGameClick(nodeIndex)}
                  >
                    {game.title}
                  </div> : <div
                    className='text-slate-400'
                  >
                    {game.title}
                  </div>}
                </div>
              </div>
              <DeleteIcon 
                className='cursor-pointer hover:bg-gray-700 rounded'
                onClick={() => handleGameDelete(game.steamGameId)}
              />
            </div>
          ) : null;
        })}
      </div>
      <input
        type="text"
        placeholder="Search for a game node"
        value={searchNodesQuery}
        onChange={(e) => setSearchNodesQuery(e.target.value)}
        className="w-full p-2 mb-2 text-black"
      />
      <h2 className="text-white mb-2">Network Nodes</h2>
      {nodes.map((node: NodeType, index: number) => {
        if(!filteredNodeList.find((item) => item === node)) return null;
        const isUserAdded = userAddedGames.find((gameId: string) => gameId === node.steamGameId);
        const { textColor, rankColor } = selectColor(index, isUserAdded ? true : false);
        return (
          <div className='flex items-center' key={node.index}>
            <div className={`${rankColor} pb-2 p-2`}>
              {index + 1}
            </div>
            <div
              className={`cursor-pointer ${textColor} pb-2 hover:bg-gray-700 p-2 rounded`}
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
