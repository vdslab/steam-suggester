import { GameDetails } from "@/types/similarGames/GameDetails";
import Image from "next/image";

const DisplayGame = (props:GameDetails) => {

  const { name, image, url } = props;

  return (
    <div>
      <Image src={image} alt={name} width={200} height={200}/>
      <p className="text-center mt-2 text-white">{name}</p>
    </div>
  )
}

export default DisplayGame
