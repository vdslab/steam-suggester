import React, { useMemo } from "react";
import { StreamerListType } from "@/types/NetworkType";
import { CIRCLE_SIZE } from "@/constants/NETWORK_DATA";

type PropsType = {
  streamerIds: StreamerListType[];
  twitchGameId: string;
  circleScale: number | undefined;
};

const HighlightStreamer: React.FC<PropsType> = ({
  streamerIds,
  twitchGameId,
  circleScale,
}) => {
  const streamerColors = useMemo(() => {
    return streamerIds
      .filter((game: StreamerListType) =>
        game.videoId.some((id) => id === twitchGameId)
      )
      .map((game: { color: string }) => game.color);
  }, [streamerIds, twitchGameId]);

  const angleStep = useMemo(() => {
    return streamerColors.length > 0 ? 360 / streamerColors.length : 0;
  }, [streamerColors]);

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
                r={CIRCLE_SIZE} // 半径
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

// カスタム比較関数を使用してReact.memoでラップ
export default React.memo(HighlightStreamer, (prevProps, nextProps) => {
  if (prevProps.twitchGameId !== nextProps.twitchGameId) return false;
  if (prevProps.circleScale !== nextProps.circleScale) return false;

  if (prevProps.streamerIds.length !== nextProps.streamerIds.length)
    return false;

  for (let i = 0; i < prevProps.streamerIds.length; i++) {
    const prevStreamer = prevProps.streamerIds[i];
    const nextStreamer = nextProps.streamerIds[i];

    if (prevStreamer.color !== nextStreamer.color) return false;

    if (prevStreamer.videoId.length !== nextStreamer.videoId.length)
      return false;

    for (let j = 0; j < prevStreamer.videoId.length; j++) {
      if (prevStreamer.videoId[j] !== nextStreamer.videoId[j]) return false;
    }
  }

  return true;
});
