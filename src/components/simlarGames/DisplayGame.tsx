import { SimilarGamePropsType } from "@/types/DetailsType";
import Image from "next/image";
import Link from "next/link";

const DisplayGame = (props:SimilarGamePropsType) => {

  const { title, imgURL, steamGameId, twitchGameId } = props;

  return (
    <Link className="flex flex-col box-border mt-[3vh]" href={`/desktop/details?steam_id=${steamGameId}&twitch_id=${twitchGameId}`}>
      <Image width={1000} height={0} src={imgURL} alt={title} priority className="mx-auto h-auto w-4/6" />
      <p className="text-center my-2 text-white">{title}</p>
    </Link>
  )
}

export default DisplayGame
