import { IconType, LinkType } from "@/types/NetworkType";

const Icon = (props: IconType) => {
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
        {/* フィルターを条件に応じてレンダリング */}
        {filterType && (
          <filter
            id={`glow-${filterType}-${index}`}
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feGaussianBlur
              in="SourceAlpha"
              stdDeviation={isSelected ? 20 : 10}
              result="blur"
            />
            <feOffset dx="0" dy="0" result="offsetBlur" />
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
        height={60}
        x={-37.5}
        y={-30}
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
};

export default Icon;
