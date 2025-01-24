import { StreamerListType } from "@/types/NetworkType";

type PropsType = {
  streamerIds: StreamerListType[];
  twitchGameId: string;
  circleScale: number | undefined;
};

const HighlightStreamer = (props: PropsType) => {
  const { streamerIds, twitchGameId, circleScale } = props;

  const streamerColors = streamerIds
    .filter((game: StreamerListType) =>
      game.videoId.some((id) => id === twitchGameId)
    )
    .map((game: { color: string }) => game.color); // 配信者の色をすべて取得

  // それぞれの色を等間隔で分けるための角度計算
  const angleStep = streamerColors.length > 0 ? 360 / streamerColors.length : 0;

  return (
    <g>
      {streamerColors.length > 0 &&
        streamerColors.map((color: string, index: number) => {
          const angleStart = -90 + angleStep * index; // -90は真上

          return (
            <g transform={`scale(${circleScale ?? 1})`} key={index}>
              <circle
                cx="0"
                cy="0"
                r="17" // 半径
                stroke={color}
                strokeWidth="1.5"
                fill="transparent"
                strokeDasharray={`${angleStep} ${360 - angleStep}`}
                strokeDashoffset={-angleStart}
              />
            </g>
          );
        })}
    </g>
  );
};

export default HighlightStreamer;
