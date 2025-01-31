import { IconType, LinkType } from "@/types/NetworkType";
import React from "react";

const Icon = React.memo((props: IconType) => {
  const {
    imgURL,
    index,
    circleScale,
    isHovered,
    selectedIndex,
    similarGamesLinkList,
  } = props;

  const isSelected = selectedIndex === index;
  const isSimilarGames =
    !isSelected &&
    similarGamesLinkList.find(
      (link: LinkType) =>
        link.source.index === index || link.target.index === index
    );

  const filterType = isSelected ? "cyan" : isSimilarGames ? "orange" : null;

  return (
    <g
      transform={`scale(${circleScale})`}
      style={{ cursor: "pointer" }}
      filter={filterType ? `url(#glow-${filterType}-${index})` : undefined}
    >
      <defs>
        {filterType && (
          <filter
            id={`glow-${filterType}-${index}`}
            x="-60%"
            y="-60%"
            width="220%"
            height="220%"
            // filterUnitsの指定も必要に応じて追加するとよい
          >
            <feGaussianBlur
              in="SourceAlpha"
              stdDeviation={10} // 適宜調整
              result="blur"
            />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.6" /> {/* 透明度の減衰を調整 */}
            </feComponentTransfer>
            <feFlood
              floodColor={
                filterType === "cyan"
                  ? "rgba(0, 255, 255, 1)"
                  : "rgba(255, 165, 0, 1)"
              }
              result="color"
            />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
      </defs>

      <image
        href={imgURL}
        width={75}
        height={40}
        x={-37.5}
        y={-20}
        style={{
          filter:
            isHovered || isSelected
              ? "brightness(1.5)"
              : isSimilarGames
              ? "brightness(1.0)"
              : selectedIndex === -1
              ? "brightness(1.0)"
              : "brightness(0.5)",
        }}
      />
    </g>
  );
});

Icon.displayName = "Icon";

export default Icon;
