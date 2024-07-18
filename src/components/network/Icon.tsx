'use client';
import { useState } from "react";
import { useRouter } from 'next/navigation';

const Icon = (props:any) => {
  const { title, imgURL, index, steamGameId, twitchGameId } = props;
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();
  const handleClick = (e:any) => {
    e.preventDefault();
    router.push(`/desktop/details/${steamGameId}/${twitchGameId}`);
  };

  return (
    <g
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      transform={`scale(1.5)`}
      /* transform={`scale(${circleSize})`} */
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
