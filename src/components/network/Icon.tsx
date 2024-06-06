'use client';
import { useState } from "react";

const Icon = (props:any) => {
  const { title, header_image, index } = props;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <g
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      transform="scale(1.5)"
      style={{ cursor: "pointer" }}
    >
      <defs>
        <clipPath id={`clip-${index}`}>
          <circle r={30} />
        </clipPath>
      </defs>
      <image
        href={header_image}
        width={75}
        height={60}
        x={-37.5}
        y={-30}
        clipPath={`url(#clip-${index})`}
      />
      {isHovered && (
        <g>
          {/* <rect
            x={-getTextWidth(title, "14px") / 2 - 25}
            y={20}
            width={getTextWidth(title, "14px") + 50}
            height={30}
            fill="white"
          ></rect> */}

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
