import { GameDetails } from "@/types/similarGames/GameDetails";
import Image from "next/image";

const DisplayGame = (props:GameDetails) => {

  const { name, image, url } = props;

  return (
    <a className="flex flex-col box-border" href={url} target="_blank" rel="noopener noreferrer">
      <Image src={image} alt={name} width={200} height={200} className="mx-auto"/>
      <p className="text-center my-2 text-white">{name}</p>
    </a>
  )
}

export default DisplayGame
