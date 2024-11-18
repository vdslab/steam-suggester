'use client';
import { useState, MouseEvent } from "react";
import { useRouter } from 'next/navigation';
import { IconType } from "@/types/NetworkType";

const Icon = (props:IconType) => {
  const { title, imgURL, index, steamGameId, twitchGameId, circleScale } = props;
  const router = useRouter();
  const handleClick = (e: MouseEvent<SVGElement>) => {
    e.preventDefault();
    router.push(`/desktop/details?steam_id=${steamGameId}&twitch_id=${twitchGameId}`);
  };

  return (
    <g
      transform={`scale(${circleScale})`}
      style={{ cursor: "pointer" }}
      onClick={handleClick}
    >
      <defs>
        <clipPath id={`clip-${index}`}>
          <circle r={17} />
        </clipPath>
      </defs>
      <image
        href={imgURL}
        width={75}
        height={60}
        x={-37.5}
        y={-30}
        clipPath={`url(#clip-${index})`}
      />
    </g>
  );
};

export default Icon;
