"use client";

import { ISR_FETCH_INTERVAL } from "@/constants/DetailsConstants";
import { NodeType, SteamListType } from "@/types/NetworkType";
import { useEffect, useState } from "react";

type Props = {
  nodes: NodeType[];
  setCenterX: React.Dispatch<React.SetStateAction<number>>;
  setCenterY: React.Dispatch<React.SetStateAction<number>>;
};

const GameList = (props: Props) => {
  const { nodes, setCenterX, setCenterY } = props;
  const [hoveredGameIdx, setHoveredGameIdx] = useState<number>(-1);
  const [steamList, setSteamList] = useState<SteamListType[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredSteamList, setFilteredSteamList] = useState<SteamListType[]>([]);

  const handleMouseClick = (index: number) => {
    setCenterX(nodes[index].x ?? 0);
    setCenterY(nodes[index].y ?? 0);
  };

  const handleSearchClick = (steamGameId: string) => {
    console.log("Selected Steam Game ID: ", steamGameId);
  };

  useEffect(() => {
    (async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_CURRENT_URL}/api/network/getSteamList`,
        { next: { revalidate: ISR_FETCH_INTERVAL } }
      );
      if (!res) {
        return {};
      }
      const data = await res.json();
      setSteamList(data);
      setFilteredSteamList(data);
    })();
  }, []);

  useEffect(() => {
    if (searchQuery === '') {
      setFilteredSteamList(steamList);
    } else {
      const filteredList = steamList.filter((game) =>
        game.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
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
            <div
              className="cursor-pointer text-white pb-2 hover:bg-gray-700 p-2 rounded"
              onClick={() => handleSearchClick(game.steamGameId)}
              key={game.steamGameId}
            >
              {game.title}
            </div>
          ))}
        </div>
      )}
      <h2 className="text-white mb-2">Network Nodes</h2>
      {nodes.map((node: NodeType, index: number) => (
        <div
          className={`cursor-pointer text-slate-${hoveredGameIdx === index ? 50 : 300} pb-2 hover:bg-gray-700 p-2 rounded`}
          onMouseEnter={() => setHoveredGameIdx(index)}
          onMouseLeave={() => setHoveredGameIdx(-1)}
          onClick={() => handleMouseClick(index)}
          key={index}
        >
          {node.title}
        </div>
      ))}
    </div>
  );
};

export default GameList;
