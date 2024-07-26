'use client';
import { useState, MouseEvent } from "react";
import { useRouter } from 'next/navigation';
import { IconType } from "@/types/NetworkType";

const Icon = (props:IconType) => {
  const { title, imgURL, index, steamGameId, twitchGameId, circleScale } = props;
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();
  const handleClick = (e: MouseEvent<SVGElement>) => {
    e.preventDefault();
    router.push(`/desktop/details/${steamGameId}/${twitchGameId}`);
  };

  return (
    <g
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
      {isHovered && (
        <g>
          <text
            x={0}
            y={40}
            textAnchor="middle"
            fill="white"
            fontSize="14px"
            pointerEvents="none"
          >
            {title}
          </text>
        </g>
      )}
    </g>
  );
};

export default Icon;
