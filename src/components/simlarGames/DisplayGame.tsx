"use client"
import React from "react";
import { SimilarGamePropsType } from "@/types/DetailsType";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from 'next/navigation';

const DisplayGame = (props: SimilarGamePropsType) => {
  const { title, imgURL, steamGameId, twitchGameId } = props;

  const currentPath = usePathname();
  const basePath = currentPath.startsWith('/desktop') ? '/desktop' : '/mobile';

  return (
    <Link
      href={`${basePath}/details?steam_id=${steamGameId}&twitch_id=${twitchGameId}`}
      className="block bg-gray-700 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300"
    >
      <div className="relative w-full">
        <Image
          src={imgURL}
          alt={title}
          width={3000}
          height={0}
          style={{ objectFit: "cover" }}
          className="w-auto h-auto transform hover:scale-105 transition-transform duration-300"
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