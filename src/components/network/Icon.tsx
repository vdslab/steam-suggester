import { IconType } from "@/types/NetworkType";

const Icon = (props: IconType) => {
  const { imgURL, index, circleScale, suggestValue } = props;

  // const blurAmount = (suggestValue > 0.5 ? suggestValue : 0) * 10;

  return (
    <g
      transform={`scale(${circleScale})`}
      style={{ cursor: "pointer" }}
      filter={`url(#glow-${index})`}
    >
      <defs>
        <clipPath id={`clip-${index}`}>
          <circle r={17} />
        </clipPath>
        {/* chat要素なので一時的にコメントアウト */}
        {/* <filter id={`glow-${index}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation={blurAmount} result="blur" />
          <feOffset dx="0" dy="0" result="offsetBlur" />
          <feFlood floodColor="rgba(173, 216, 230, 1)" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter> */}
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
