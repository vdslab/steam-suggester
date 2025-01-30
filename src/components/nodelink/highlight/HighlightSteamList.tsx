import { CIRCLE_SIZE } from "@/constants/NETWORK_DATA";
import React, { useMemo } from "react";

type PropsType = {
  myGamesError: Error | null;
  friendsGamesError: Error | null;
  myOwnGames: GetSteamOwnedGamesResponse[] | undefined;
  friendsOwnGames: GetFriendGamesResponse[] | undefined;
  circleScale: number | undefined;
  index: number;
  title: string;
};

const HighlightSteamList: React.FC<PropsType> = ({
  myGamesError,
  friendsGamesError,
  myOwnGames,
  friendsOwnGames,
  circleScale,
  index,
  title,
}) => {
  const isMyOwned = useMemo(() => {
    return myOwnGames ? myOwnGames.some((game) => game.title === title) : false;
  }, [myOwnGames, title]);

  const isFriendOwned = useMemo(() => {
    return friendsOwnGames
      ? friendsOwnGames.some((game) => game.gameName === title)
      : false;
  }, [friendsOwnGames, title]);

  const gradientId = useMemo(() => {
    if (isMyOwned && isFriendOwned) return `green-gradient-${index}`;
    if (isMyOwned && !isFriendOwned) return `blue-gradient-${index}`;
    if (!isMyOwned && isFriendOwned) return `yellow-gradient-${index}`;
    return "";
  }, [isMyOwned, isFriendOwned, index]);

  const gradientColors = useMemo(() => {
    if (isMyOwned && isFriendOwned) {
      return {
        start: "rgba(0, 255, 0, 0.8)",
        middle: "rgba(0, 255, 0, 0.5)",
        end: "rgba(0, 255, 0, 0.3)",
      };
    }
    if (isMyOwned && !isFriendOwned) {
      return {
        start: "rgba(0, 0, 255, 0.8)",
        middle: "rgba(0, 0, 255, 0.5)",
        end: "rgba(0, 0, 255, 0.3)",
      };
    }
    if (!isMyOwned && isFriendOwned) {
      return {
        start: "rgba(255, 255, 0, 0.8)",
        middle: "rgba(255, 255, 0, 0.5)",
        end: "rgba(255, 255, 0, 0.3)",
      };
    }
    return null;
  }, [isMyOwned, isFriendOwned]);

  const shouldRender = useMemo(() => {
    return !myGamesError && !friendsGamesError && (isMyOwned || isFriendOwned);
  }, [myGamesError, friendsGamesError, isMyOwned, isFriendOwned]);

  if (!shouldRender || !gradientColors) {
    return null;
  }

  return (
    <g>
      <g transform={`scale(${circleScale ?? 1})`}>
        {/* グラデーション定義 */}
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradientColors.start} />
            <stop offset="50%" stopColor={gradientColors.middle} />
            <stop offset="100%" stopColor={gradientColors.end} />
          </linearGradient>
        </defs>

        {/* 内側の回転する円 */}
        <circle
          cx="0"
          cy="0"
          r={CIRCLE_SIZE} // 半径
          stroke={`url(#${gradientId})`}
          strokeWidth="3"
          fill="transparent"
          style={{
            animation: "fastRotate 1.5s linear infinite",
          }}
        />

        {/* 波動の円 */}
        <circle
          cx="0"
          cy="0"
          r={CIRCLE_SIZE}
          stroke={
            isMyOwned && isFriendOwned
              ? "rgba(0, 255, 0, 0.5)"
              : isMyOwned
              ? "rgba(0, 0, 255, 0.5)"
              : "rgba(255, 255, 0, 0.5)"
          }
          strokeWidth="2"
          fill="transparent"
          style={{
            animation:
              isMyOwned && isFriendOwned
                ? "waveExpand 2.5s ease-out infinite"
                : isMyOwned
                ? "waveExpand 2.5s ease-out infinite"
                : "waveExpand 2.5s ease-out infinite",
          }}
        />
      </g>
    </g>
  );
};

export default React.memo(HighlightSteamList, (prevProps, nextProps) => {
  if (prevProps.myGamesError?.message !== nextProps.myGamesError?.message)
    return false;
  if (
    prevProps.friendsGamesError?.message !==
    nextProps.friendsGamesError?.message
  )
    return false;

  if (prevProps.circleScale !== nextProps.circleScale) return false;

  if (prevProps.index !== nextProps.index) return false;

  if (prevProps.title !== nextProps.title) return false;

  if (prevProps.myOwnGames?.length !== nextProps.myOwnGames?.length) {
    return false;
  }
  if (prevProps.myOwnGames && nextProps.myOwnGames) {
    for (let i = 0; i < prevProps.myOwnGames.length; i++) {
      if (prevProps.myOwnGames[i].title !== nextProps.myOwnGames[i].title) {
        return false;
      }
    }
  }

  if (prevProps.friendsOwnGames?.length !== nextProps.friendsOwnGames?.length) {
    return false;
  }
  if (prevProps.friendsOwnGames && nextProps.friendsOwnGames) {
    for (let i = 0; i < prevProps.friendsOwnGames.length; i++) {
      if (
        prevProps.friendsOwnGames[i].gameName !==
        nextProps.friendsOwnGames[i].gameName
      ) {
        return false;
      }
    }
  }

  return true;
});
