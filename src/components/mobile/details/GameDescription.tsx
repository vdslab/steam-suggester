import { ISR_FETCH_INTERVAL } from "@/constants/DetailsConstants";
import Image from "next/image";
import Link from "next/link";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DescriptionDetail from "./DescriptionDetail";
import { SteamDetailsDataType } from "@/types/api/getSteamDetailType";


type Props = {
  steamGameId: string;
  twitchGameId: string;
}


const GameDescription = async(props:Props) => {
  const { steamGameId } = props;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_CURRENT_URL}/api/details/getSteamGameDetail/${steamGameId}`,
    {next: { revalidate: ISR_FETCH_INTERVAL }}
  );
  const data:SteamDetailsDataType = await response.json();


  return (
    <>
      <div className="container">
        <div className="rounded-lg overflow-hidden border border-gray-400">
          <Image src={data.imgURL} alt="Game Header" width={1000} height={0} className="w-full h-auto" />
        </div>
      </div>
      <Link href={`https://store.steampowered.com/app/${steamGameId}/`} target="_blank" rel="noopener noreferrer" className="text-3xl font-semibold m-3 text-white flex justify-center">
        {data.title}
        <OpenInNewIcon className="text-2xl ml-2 mt-2" />
      </Link>
      <DescriptionDetail data={data} />
    </>
  )
}

export default GameDescription;
