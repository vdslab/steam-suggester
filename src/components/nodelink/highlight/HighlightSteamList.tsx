type PropsType = {
  myGamesError: Error;
  friendsGamesError: Error;
  myOwnGames: GetSteamOwnedGamesResponse[] | undefined;
  friendsOwnGames: GetFriendGamesResponse[] | undefined;
  circleScale: number | undefined;
  index: number;
  title: string;
};

const HighlightSteamList = (props: PropsType) => {
  const {
    myGamesError,
    friendsGamesError,
    myOwnGames,
    friendsOwnGames,
    circleScale,
    index,
    title,
  } = props;

  const isMyOwned =
    (myOwnGames && myOwnGames.some((value) => title === value.title)) || false;
  const isFriendOwned =
    (friendsOwnGames &&
      friendsOwnGames.some((value) => title === value.gameName)) ||
    false;

  return (
    <g>
      {!myGamesError && !friendsGamesError && (
        <g transform={`scale(${circleScale})`}>
          {/* 自分＆フレンドが所有しているゲーム */}
          {isMyOwned && isFriendOwned && (
            <>
              {/* グラデーション定義 */}
              <defs>
                <linearGradient
                  id={`green-gradient-${index}`}
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="rgba(0, 255, 0, 0.8)" />
                  <stop offset="50%" stopColor="rgba(0, 255, 0, 0.5)" />
                  <stop offset="100%" stopColor="rgba(0, 255, 0, 0.3)" />
                </linearGradient>
              </defs>

              {/* 内側の回転する円 */}
              <circle
                cx="0"
                cy="0"
                r="17"
                stroke={`url(#green-gradient-${index})`}
                strokeWidth="3"
                fill="transparent"
                style={{
                  animation: "fastRotate 1.5s linear infinite",
                }}
              />

              {/* 緑の波動 */}
              <circle
                cx="0"
                cy="0"
                r="17"
                stroke="rgba(0, 255, 0, 0.5)"
                strokeWidth="2"
                fill="transparent"
                style={{
                  animation: "waveExpand 2.5s ease-out infinite",
                }}
              />
            </>
          )}

          {/* 自分が所有しているゲーム */}
          {isMyOwned && !isFriendOwned && (
            <>
              {/* グラデーション定義 */}
              <defs>
                <linearGradient
                  id={`blue-gradient-${index}`}
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="rgba(0, 0, 255, 0.8)" />
                  <stop offset="50%" stopColor="rgba(0, 0, 255, 0.5)" />
                  <stop offset="100%" stopColor="rgba(0, 0, 255, 0.3)" />
                </linearGradient>
              </defs>

              {/* 内側の回転する円 */}
              <circle
                cx="0"
                cy="0"
                r="17"
                stroke={`url(#blue-gradient-${index})`}
                strokeWidth="3"
                fill="transparent"
                style={{
                  animation: "fastRotate 1.5s linear infinite",
                }}
              />

              {/* 青の波動 */}
              <circle
                cx="0"
                cy="0"
                r="17"
                stroke="rgba(0, 0, 255, 0.5)"
                strokeWidth="2"
                fill="transparent"
                style={{
                  animation: "waveExpand 2.5s ease-out infinite",
                }}
              />
            </>
          )}

          {/* フレンドが所有しているゲーム */}
          {!isMyOwned && isFriendOwned && (
            <>
              {/* グラデーション定義 */}
              <defs>
                <linearGradient
                  id={`yellow-gradient-${index}`}
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="rgba(255, 255, 0, 0.8)" />
                  <stop offset="50%" stopColor="rgba(255, 255, 0, 0.5)" />
                  <stop offset="100%" stopColor="rgba(255, 255, 0, 0.3)" />
                </linearGradient>
              </defs>

              {/* 内側の回転する円 */}
              <circle
                cx="0"
                cy="0"
                r="17"
                stroke={`url(#yellow-gradient-${index})`}
                strokeWidth="3"
                fill="transparent"
                style={{
                  animation: "fastRotate 1.5s linear infinite",
                }}
              />

              {/* 黄の波動 */}
              <circle
                cx="0"
                cy="0"
                r="17"
                stroke="rgba(255, 255, 0, 0.5)"
                strokeWidth="2"
                fill="transparent"
                style={{
                  animation: "waveExpand 2.5s ease-out infinite",
                }}
              />
            </>
          )}
        </g>
      )}
    </g>
  );
};

export default HighlightSteamList;
