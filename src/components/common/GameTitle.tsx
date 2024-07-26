import { ISR_FETCH_INTERVAL } from "@/constants/DetailsConstants";
import { DetailsPropsType } from "@/types/DetailsType";
import Link from "next/link";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

const GameTitle = async (props: DetailsPropsType) => {
  const { steamGameId } = props;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_CURRENT_URL}/api/details/getSteamGameDetail/${steamGameId}`,
    {next: { revalidate: ISR_FETCH_INTERVAL }}
  );
  const data = await response.json();


  return (
    <Link href={`https://store.steampowered.com/app/${steamGameId}/`} target="_blank" rel="noopener noreferrer" className="text-5xl font-semibold mb-4 text-white flex justify-center hover:underline">
      {data.title}
      <OpenInNewIcon className="text-3xl ml-2 mt-3" />
    </Link>
  );
}

export default GameTitle;
