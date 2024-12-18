import useSWR from 'swr';
import { ISR_FETCH_INTERVAL } from "@/constants/DetailsConstants";
import { DetailsPropsType } from "@/types/DetailsType";
import Link from "next/link";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { fetcher } from './Fetcher';

const GameTitle = ({ steamGameId }: DetailsPropsType) => {
  const { data, error } = useSWR(
    `${process.env.NEXT_PUBLIC_CURRENT_URL}/api/details/getSteamGameDetail/${steamGameId}`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: ISR_FETCH_INTERVAL }
  );

  if (error) {
    return <div className="text-red-500">Failed to load game details.</div>;
  }

  if (!data) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className="flex justify-center">
      <Link
        href={`https://store.steampowered.com/app/${steamGameId}/`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center text-5xl font-semibold mb-4 text-white hover:underline"
      >
        {data.title}
        <OpenInNewIcon className="text-3xl ml-2 mt-3" />
      </Link>
    </div>
  );
};

export default GameTitle;
