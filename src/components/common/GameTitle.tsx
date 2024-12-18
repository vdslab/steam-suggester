'use client'
import { DetailsPropsType } from "@/types/DetailsType";
import Link from "next/link";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import fetchWithCache from '@/hooks/fetchWithCache';
import { useState, useEffect } from 'react';
import { SteamDetailsDataType } from '@/types/api/getSteamDetailType';


const GameTitle = ({ steamGameId }: DetailsPropsType) => {

  const [ data, setData ] = useState<SteamDetailsDataType | null>(null);

  useEffect(() => {

    const fetchGameData = async () => {
      try {
        const data = await fetchWithCache(`${process.env.NEXT_PUBLIC_CURRENT_URL}/api/details/getSteamGameDetail/${steamGameId}`);
        setData(data);
      } catch (err: any) {
        console.error(err);
      }
    };

    fetchGameData();
  }, [steamGameId]);

  if (!data) {
    return;
  }

  return (
    <div className="flex justify-center">
      <Link
        href={`https://store.steampowered.com/app/${steamGameId}/`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center text-5xl font-semibold text-white hover:underline"
      >
        {data.title}
        <OpenInNewIcon className="text-3xl ml-2 mt-3" />
      </Link>
    </div>
  );
};

export default GameTitle;
