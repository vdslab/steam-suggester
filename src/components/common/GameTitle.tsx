import Link from "next/link";

const GameTitle = async (props: {steamGameId:string}) => {
  const { steamGameId } = props;

  const response = await fetch(`${process.env.NEXT_PUBLIC_CURRENT_URL}/api/details/getSteamGameDetail/${steamGameId}`);
  const data = await response.json();


  return (
    <Link href={`https://store.steampowered.com/app/${steamGameId}/`} className="text-5xl font-semibold mb-4 text-white flex justify-center">{data.title}</Link>
  );
}

export default GameTitle;
