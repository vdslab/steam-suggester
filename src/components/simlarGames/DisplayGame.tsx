/* components/similarGames/DisplayGame.tsx */
import React from "react";
import { SimilarGamePropsType } from "@/types/DetailsType";
import Image from "next/image";
import Link from "next/link";

const DisplayGame = (props: SimilarGamePropsType) => {
  const { title, imgURL, steamGameId, twitchGameId } = props;

  return (
    <Link
      href={`/desktop/details?steam_id=${steamGameId}&twitch_id=${twitchGameId}`}
      className="block bg-gray-700 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300"
    >
      <div className="relative w-full h-40">
        <Image
          src={imgURL}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" 
          style={{ objectFit: "cover" }}
          className="transform hover:scale-105 transition-transform duration-300"
          priority
        />
      </div>
      <div className="p-4">
        <p className="text-center text-white font-semibold">{title}</p>
      </div>
    </Link>
  );
};

export default DisplayGame;
