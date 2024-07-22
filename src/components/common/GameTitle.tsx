import { ISR_FETCH_INTERVAL } from "@/constants/DetailsConstants";
import { DetailsPropsType } from "@/types/DetailsType";
import Link from "next/link";

const GameTitle = async (props: DetailsPropsType) => {
  const { steamGameId } = props;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_CURRENT_URL}/api/details/getSteamGameDetail/${steamGameId}`,
    {next: { revalidate: ISR_FETCH_INTERVAL }}
  );
  const data = await response.json();


  return (
    <Link href={`https://store.steampowered.com/app/${steamGameId}/`} className="text-5xl font-semibold mb-4 text-white flex justify-center">{data.title}</Link>
  );
}

export default GameTitle;
