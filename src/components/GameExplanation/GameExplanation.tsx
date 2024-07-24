'use server'
import Headline from "../common/Headline";

type Props = {
  steamGameId: string;
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
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="bg-[#2a475e] shadow-md rounded-lg overflow-hidden border border-gray-400">
        <img
          src={data.header_image}
          alt="Game Header"
          className="w-full h-auto object-cover"
        />
        <div className="p-6">
          {/* <h1 className="text-2xl font-bold mb-4">{data.title}</h1> */}
          <p className="text-white">{data.description}</p>
        </div>
      </div>
    </div>
  )
}

export default GameExplanation
