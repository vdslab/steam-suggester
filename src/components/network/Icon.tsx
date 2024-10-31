'use client';
import { MouseEvent } from "react";
import { useRouter } from 'next/navigation';
import { IconType } from "@/types/NetworkType";

const Icon = (props: IconType) => {
  const { title, imgURL, index, steamGameId, twitchGameId, circleScale, suggestValue } = props;
  const router = useRouter();

  const blurAmount = (suggestValue > 0.5 ? suggestValue : 0) * 10;

  const handleClick = (e: MouseEvent<SVGElement>) => {
    e.preventDefault();
    router.push(`/desktop/details?steam_id=${steamGameId}&twitch_id=${twitchGameId}`);
  };

  return (
    <g
      transform={`scale(${circleScale})`}
      style={{ cursor: "pointer" }}
      onClick={handleClick}
      filter={`url(#glow-${index})`}
    >
      <defs>
        <clipPath id={`clip-${index}`}>
          <circle r={17} />
        </clipPath>
        {/* グロー効果のフィルター定義 */}
        <filter id={`glow-${index}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation={blurAmount} result="blur" />
          <feOffset dx="0" dy="0" result="offsetBlur" />
          <feFlood floodColor="rgba(173, 216, 230, 1)" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* アイコンの画像 */}
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
