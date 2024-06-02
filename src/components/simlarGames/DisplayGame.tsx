import { GameDetails } from "@/types/similarGames/GameDetails";
import Image from "next/image";

const DisplayGame = (props:GameDetails) => {

  const { name, image, url } = props;

  return (
    <div className="flex flex-col box-border">
      <Image src={image} alt={name} width={200} height={200} className="mx-auto"/>
      <p className="text-center my-2 text-white">{name}</p>
    </div>
  )
}

export default DisplayGame
