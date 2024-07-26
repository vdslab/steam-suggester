'use server'
import Image from "next/image";

type Props = {
  steamGameId: string;
  twitchGameId: string;
}

const GameExplanation = async(props:Props) => {
  const { steamGameId } = props;

  const res = await fetch(`${process.env.NEXT_PUBLIC_CURRENT_URL}/api/details/getSteamGameDetail/${steamGameId}`, {
    cache: 'no-store'
  });
  if (!res.ok) {
    throw new Error('Failed to fetch game details');
  }
  const data = await res.json();

  return (
    <div className="container w-4/5 mx-auto p-4 max-w-3xl">
      <div className="rounded-lg overflow-hidden border border-gray-400">
        <Image src={data.image} alt="Game Header" width={1000} height={0} className="w-full h-auto" />
        {/* <div className="p-6">
          <div className="text-white max-h-20 overflow-y-auto">{data.short_description}</div>
        </div> */}
      </div>
    </div>
  )
}

export default GameExplanation
