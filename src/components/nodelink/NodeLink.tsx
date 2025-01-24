"use client";
import { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import Icon from "./Icon";
import { LinkType, NodeType, StreamerListType } from "@/types/NetworkType";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { fetcher } from "../common/Fetcher";
import { ISR_FETCH_INTERVAL } from "@/constants/DetailsConstants";
import Popup from "./Popup";
import GameTooltip from "./GameTooltip";
import HighlightStreamer from "./highlight/HighlightStreamer";
import HighlightTag from "./highlight/HighlightTag";

const DEFAULT_TOOLTIP = {
  index: -1,
  x: 0,
  y: 0,
};

type NodeLinkProps = {
  nodes: NodeType[];
  links: LinkType[];
  centerX: number;
  centerY: number;
  selectedIndex: number;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
  streamerIds: StreamerListType[];
  openPanel: string | null;
  selectedTags: string[];
};

type ZoomableSVGProps = {
  children: (transform: d3.ZoomTransform) => React.ReactNode;
  centerX: number;
  centerY: number;
};

type TooltipType = {
  index: number;
  x: number;
  y: number;
};

const ZoomableSVG: React.FC<ZoomableSVGProps> = (props) => {
  const { children, centerX, centerY } = props;
  const svgRef = useRef<SVGSVGElement>(null);
  const [transform, setTransform] = useState(d3.zoomIdentity);

  const zoom = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  useEffect(() => {
    zoom.current = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.25, 4])
      .on("start", () => {
        if (svgRef.current) {
          d3.select(svgRef.current).style("cursor", "grabbing");
        }
      })
      .on("zoom", (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        setTransform(event.transform);
      })
      .on("end", () => {
        if (svgRef.current) {
          d3.select(svgRef.current).style("cursor", "grab");
        }
      });

    if (svgRef.current) {
      const svg = d3.select<SVGSVGElement, unknown>(svgRef.current);
      svg.call(zoom.current);
    }
  }, []);

  useEffect(() => {
    if (svgRef.current && zoom.current) {
      const svg = d3.select<SVGSVGElement, unknown>(svgRef.current);

      const initialTransform = d3.zoomIdentity
        .translate(
          window.innerWidth / 2 - window.innerWidth / 7 - centerX,
          (window.innerHeight * 3) / 5 - centerY
        )
        .scale(1);
      svg
        .transition()
        .duration(1200)
        .call(zoom.current.transform, initialTransform)
        .on("end", () => {
          setTransform(initialTransform);
        });
    }
  }, [centerX, centerY]);

  return (
    <svg ref={svgRef} width="100%" height="100%">
      <g
        transform={`translate(${transform.x},${transform.y})scale(${transform.k})`}
      >
        {children(transform)}
      </g>
    </svg>
  );
};

const NodeLink = (props: NodeLinkProps) => {
  const {
    nodes,
    links,
    centerX,
    centerY,
    selectedIndex,
    setSelectedIndex,
    streamerIds = [],
    openPanel,
    selectedTags,
  } = props;

  const [hoveredIndex, setHoveredIndex] = useState<number>(-1);
  const [tooltip, setTooltip] = useState<TooltipType>(DEFAULT_TOOLTIP);
  const [background, setBackground] = useState<string>("");

  const { data: session, status } = useSession();

  const steamId = session?.user?.email
    ? session.user.email.split("@")[0]
    : null;

  // 自分の所有ゲームを取得
  const { data: myOwnGames, error: myGamesError } = useSWR<
    GetSteamOwnedGamesResponse[]
  >(
    status === "authenticated" && steamId
      ? `${process.env.NEXT_PUBLIC_CURRENT_URL}/api/network/getSteamOwnedGames?steamId=${steamId}`
      : null,
    fetcher,
    { refreshInterval: ISR_FETCH_INTERVAL }
  );

  // フレンドの所有ゲームを取得
  const { data: friendsOwnGames, error: friendsGamesError } = useSWR<
    GetFriendGamesResponse[]
  >(
    status === "authenticated" && steamId
      ? `${process.env.NEXT_PUBLIC_CURRENT_URL}/api/network/getFriendGames?steamId=${steamId}`
      : null,
    fetcher,
    { refreshInterval: ISR_FETCH_INTERVAL }
  );

  // 選択されたエッジのリスト
  const selectedLinks = links.filter((link: LinkType) => {
    return (
      link.source.index === selectedIndex || link.target.index === selectedIndex
    );
  });

  // 非選択エッジのリスト
  const nonSelectedLinks = links.filter((link: LinkType) => {
    return (
      link.source.index !== selectedIndex && link.target.index !== selectedIndex
    );
  });

  const linkScale = d3.scaleLinear().domain([0, 50, 100]).range([0, 0.1, 2]);

  // similarity スコアに基づく色スケールの定義
  const colorScale = d3
    .scaleLinear<string>()
    .domain([0, 50, 100]) // スコアの範囲に応じて調整
    .range(["red", "yellow", "green"]);

  // 背景変更を適用
  useEffect(() => {
    if (selectedIndex !== -1) {
      const selectedNode = nodes.find((node) => node.index === selectedIndex);
      if (selectedNode && selectedNode.background) {
        setBackground(selectedNode.background);
      } else {
        setBackground(""); // デフォルト背景に戻す
      }
    } else {
      setBackground(""); // デフォルト背景に戻す
    }
  }, [selectedIndex, nodes]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        backgroundImage: background ? `url(${background})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        transition: "background-image 0.5s ease", // 背景切り替えのアニメーション
      }}
    >
      <ZoomableSVG centerX={centerX} centerY={centerY}>
        {(transform) => (
          <>
            {/* 非選択エッジを最初に描画 */}
            {nonSelectedLinks.length > 0 &&
              nonSelectedLinks.map((link: LinkType, i: number) => {
                const isHovered =
                  (link.source.index === hoveredIndex &&
                    link.target.index === selectedIndex) ||
                  (link.source.index === selectedIndex &&
                    link.target.index === hoveredIndex);
                const isSelected =
                  link.source.index === selectedIndex ||
                  link.target.index === selectedIndex;

                return (
                  <line
                    key={i}
                    className="link"
                    x1={link.source.x}
                    y1={link.source.y}
                    x2={link.target.x}
                    y2={link.target.y}
                    style={{
                      stroke: isHovered
                        ? "orange"
                        : isSelected
                        ? "cyan"
                        : "white",
                      strokeWidth:
                        isHovered || isSelected
                          ? Math.max(
                              linkScale(link.similarity as number),
                              0.1
                            ) + 1
                          : Math.max(linkScale(link.similarity as number), 0.1),
                    }}
                  />
                );
              })}

            {/* 選択されていないノードを描画 */}
            {nodes.length !== 0 &&
              nodes.map((node: NodeType, i: number) => {
                if (
                  selectedIndex === i ||
                  selectedLinks.find(
                    (link: LinkType) =>
                      link.source === node || link.target === node
                  )
                )
                  return;

                const isHovered = node.index === hoveredIndex;
                const isHighlight = selectedTags.length
                  ? selectedTags.every((tag) => node.tags?.includes(tag))
                  : false;
                const isMyOwned =
                  myOwnGames &&
                  myOwnGames.some((value) => node.title === value.title);
                const isFriedOwned =
                  friendsOwnGames &&
                  friendsOwnGames.some(
                    (value) => node.title === value.gameName
                  );
                return (
                  <g
                    transform={`translate(${node.x},${node.y})`}
                    onMouseEnter={() => setHoveredIndex(node.index ?? -1)}
                    onMouseLeave={() => setHoveredIndex(-1)}
                    onClick={() => {
                      if (selectedIndex !== node.index) {
                        setSelectedIndex(node.index);
                        setHoveredIndex(-1);
                      }
                    }}
                    key={i}
                  >
                    <Icon
                      title={node.title}
                      imgURL={node.imgURL}
                      index={node.index ?? i}
                      steamGameId={node.steamGameId}
                      twitchGameId={node.twitchGameId}
                      circleScale={node.circleScale ?? 1}
                      suggestValue={node.suggestValue}
                      isHovered={isHovered}
                      selectedIndex={selectedIndex}
                      similarGamesLinkList={selectedLinks}
                    />
                    {/* 色付きセグメントを描画 配信者による強調 */}
                    {openPanel === "streamer" && (
                      <HighlightStreamer
                        streamerIds={streamerIds}
                        twitchGameId={node.twitchGameId}
                        circleScale={node.circleScale}
                      />
                    )}

                    {openPanel === "highlight" && (
                      <HighlightTag
                        isHighlight={isHighlight}
                        circleScale={node.circleScale}
                        index={node.index}
                      />
                    )}

                    {openPanel === "steamList" &&
                      !myGamesError &&
                      !friendsGamesError && (
                        <g transform={`scale(${node.circleScale})`}>
                          {/* 自分＆フレンドが所有しているゲーム */}
                          {isMyOwned && isFriedOwned && (
                            <>
                              {/* グラデーション定義 */}
                              <defs>
                                <linearGradient
                                  id={`green-gradient-${node.index}`}
                                  x1="0%"
                                  y1="0%"
                                  x2="100%"
                                  y2="100%"
                                >
                                  <stop
                                    offset="0%"
                                    stopColor="rgba(0, 255, 0, 0.8)"
                                  />
                                  <stop
                                    offset="50%"
                                    stopColor="rgba(0, 255, 0, 0.5)"
                                  />
                                  <stop
                                    offset="100%"
                                    stopColor="rgba(0, 255, 0, 0.3)"
                                  />
                                </linearGradient>
                              </defs>

                              {/* 内側の回転する円 */}
                              <circle
                                cx="0"
                                cy="0"
                                r="17"
                                stroke={`url(#green-gradient-${node.index})`}
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
                                  animation:
                                    "waveExpand 2.5s ease-out infinite",
                                }}
                              />
                            </>
                          )}

                          {/* 自分が所有しているゲーム */}
                          {isMyOwned && !isFriedOwned && (
                            <>
                              {/* グラデーション定義 */}
                              <defs>
                                <linearGradient
                                  id={`blue-gradient-${node.index}`}
                                  x1="0%"
                                  y1="0%"
                                  x2="100%"
                                  y2="100%"
                                >
                                  <stop
                                    offset="0%"
                                    stopColor="rgba(0, 0, 255, 0.8)"
                                  />
                                  <stop
                                    offset="50%"
                                    stopColor="rgba(0, 0, 255, 0.5)"
                                  />
                                  <stop
                                    offset="100%"
                                    stopColor="rgba(0, 0, 255, 0.3)"
                                  />
                                </linearGradient>
                              </defs>

                              {/* 内側の回転する円 */}
                              <circle
                                cx="0"
                                cy="0"
                                r="17"
                                stroke={`url(#blue-gradient-${node.index})`}
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
                                  animation:
                                    "waveExpand 2.5s ease-out infinite",
                                }}
                              />
                            </>
                          )}

                          {/* フレンドが所有しているゲーム */}
                          {!isMyOwned && isFriedOwned && (
                            <>
                              {/* グラデーション定義 */}
                              <defs>
                                <linearGradient
                                  id={`yellow-gradient-${node.index}`}
                                  x1="0%"
                                  y1="0%"
                                  x2="100%"
                                  y2="100%"
                                >
                                  <stop
                                    offset="0%"
                                    stopColor="rgba(255, 255, 0, 0.8)"
                                  />
                                  <stop
                                    offset="50%"
                                    stopColor="rgba(255, 255, 0, 0.5)"
                                  />
                                  <stop
                                    offset="100%"
                                    stopColor="rgba(255, 255, 0, 0.3)"
                                  />
                                </linearGradient>
                              </defs>

                              {/* 内側の回転する円 */}
                              <circle
                                cx="0"
                                cy="0"
                                r="17"
                                stroke={`url(#yellow-gradient-${node.index})`}
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
                                  animation:
                                    "waveExpand 2.5s ease-out infinite",
                                }}
                              />
                            </>
                          )}
                        </g>
                      )}
                  </g>
                );
              })}

            {/* 選択エッジとスコアを描画 */}
            <g className="selected-edges">
              {selectedLinks.length > 0 &&
                selectedLinks.map((link: LinkType, i: number) => {
                  const isHovered =
                    (link.source.index === hoveredIndex &&
                      link.target.index === selectedIndex) ||
                    (link.source.index === selectedIndex &&
                      link.target.index === hoveredIndex);

                  // エッジ中点計算にノードの半径を考慮
                  const sourceX = link.source.x as number;
                  const sourceY = link.source.y as number;
                  const targetX = link.target.x as number;
                  const targetY = link.target.y as number;

                  const sourceRadius = 17 * (link.source.circleScale ?? 1);
                  const targetRadius = 17 * (link.target.circleScale ?? 1);

                  // ベクトル方向を計算
                  const deltaX = targetX - sourceX;
                  const deltaY = targetY - sourceY;
                  const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);

                  // 正規化
                  const normalizedX = deltaX / distance;
                  const normalizedY = deltaY / distance;

                  // ノードの端から端までの位置を調整
                  const adjustedSourceX = sourceX + normalizedX * sourceRadius;
                  const adjustedSourceY = sourceY + normalizedY * sourceRadius;
                  const adjustedTargetX = targetX - normalizedX * targetRadius;
                  const adjustedTargetY = targetY - normalizedY * targetRadius;

                  // ノードの端の中間地点
                  const midX = (adjustedSourceX + adjustedTargetX) / 2;
                  const midY = (adjustedSourceY + adjustedTargetY) / 2;

                  return (
                    <g key={`selected-${i}`}>
                      {/* エッジ表示 */}
                      <line
                        x1={sourceX}
                        y1={sourceY}
                        x2={targetX}
                        y2={targetY}
                        style={{
                          stroke: isHovered ? "orange" : "cyan",
                          strokeWidth:
                            Math.max(
                              linkScale(link.similarity as number),
                              0.1
                            ) + 1,
                        }}
                      />

                      {/* エッジスコアの表示 */}
                      {link.similarity !== undefined && (
                        <g
                          className="edge-score-group"
                          transform={`translate(${midX}, ${midY})`}
                        >
                          <g
                            onMouseEnter={() =>
                              setTooltip({
                                index: i,
                                x: midX,
                                y: midY,
                              })
                            }
                            onMouseLeave={() => setTooltip(DEFAULT_TOOLTIP)}
                          >
                            {/* 背景の円形 */}
                            <circle
                              cx={0}
                              cy={0}
                              r={15} // 半径
                              stroke={isHovered ? "orange" : "cyan"} // エッジの色に合わせる
                              strokeWidth={
                                Math.max(
                                  linkScale(link.similarity as number),
                                  0.1
                                ) + 1
                              }
                              fill={colorScale(link.similarity)} // スコアに
                            />
                            {/* similarity スコアの表示 */}
                            <text
                              x={0}
                              y={4} // テキストの中央寄せ調整
                              textAnchor="middle"
                              fill="#fff" // 白色に変更
                              fontSize="12px"
                              className="edge-score"
                            >
                              {link.similarity}
                            </text>
                          </g>
                        </g>
                      )}
                    </g>
                  );
                })}
            </g>

            {/* 選択されているノード及びそれとつながっているノードを描画 */}
            {nodes.length !== 0 &&
              nodes.map((node: NodeType, i: number) => {
                if (
                  selectedIndex !== i &&
                  !selectedLinks.find(
                    (link: LinkType) =>
                      link.source === node || link.target === node
                  )
                )
                  return;

                const isHovered = node.index === hoveredIndex;
                const isHighlight = selectedTags.length
                  ? selectedTags.every((tag) => node.tags?.includes(tag))
                  : false;
                const isMyOwned =
                  myOwnGames &&
                  myOwnGames.some((value) => node.title === value.title);
                const isFriedOwned =
                  friendsOwnGames &&
                  friendsOwnGames.some(
                    (value) => node.title === value.gameName
                  );
                return (
                  <g
                    transform={`translate(${node.x},${node.y})`}
                    onMouseEnter={() => setHoveredIndex(node.index ?? -1)}
                    onMouseLeave={() => setHoveredIndex(-1)}
                    onClick={() => {
                      if (selectedIndex !== node.index) {
                        setSelectedIndex(node.index);
                        setHoveredIndex(-1);
                      }
                    }}
                    key={i}
                  >
                    <Icon
                      title={node.title}
                      imgURL={node.imgURL}
                      index={node.index ?? i}
                      steamGameId={node.steamGameId}
                      twitchGameId={node.twitchGameId}
                      circleScale={node.circleScale ?? 1}
                      suggestValue={node.suggestValue}
                      isHovered={isHovered}
                      selectedIndex={selectedIndex}
                      similarGamesLinkList={selectedLinks}
                    />
                    {/* 色付きセグメントを描画 配信者による強調 */}
                    {openPanel === "streamer" && (
                      <HighlightStreamer
                        streamerIds={streamerIds}
                        twitchGameId={node.twitchGameId}
                        circleScale={node.circleScale}
                      />
                    )}

                    {openPanel === "highlight" && (
                      <HighlightTag
                        isHighlight={isHighlight}
                        circleScale={node.circleScale}
                        index={node.index}
                      />
                    )}

                    {openPanel === "steamList" &&
                      !myGamesError &&
                      !friendsGamesError && (
                        <g transform={`scale(${node.circleScale})`}>
                          {/* 自分＆フレンドが所有しているゲーム */}
                          {isMyOwned && isFriedOwned && (
                            <>
                              {/* グラデーション定義 */}
                              <defs>
                                <linearGradient
                                  id={`green-gradient-${node.index}`}
                                  x1="0%"
                                  y1="0%"
                                  x2="100%"
                                  y2="100%"
                                >
                                  <stop
                                    offset="0%"
                                    stopColor="rgba(0, 255, 0, 0.8)"
                                  />
                                  <stop
                                    offset="50%"
                                    stopColor="rgba(0, 255, 0, 0.5)"
                                  />
                                  <stop
                                    offset="100%"
                                    stopColor="rgba(0, 255, 0, 0.3)"
                                  />
                                </linearGradient>
                              </defs>

                              {/* 内側の回転する円 */}
                              <circle
                                cx="0"
                                cy="0"
                                r="17"
                                stroke={`url(#green-gradient-${node.index})`}
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
                                  animation:
                                    "waveExpand 2.5s ease-out infinite",
                                }}
                              />
                            </>
                          )}

                          {/* 自分が所有しているゲーム */}
                          {isMyOwned && !isFriedOwned && (
                            <>
                              {/* グラデーション定義 */}
                              <defs>
                                <linearGradient
                                  id={`blue-gradient-${node.index}`}
                                  x1="0%"
                                  y1="0%"
                                  x2="100%"
                                  y2="100%"
                                >
                                  <stop
                                    offset="0%"
                                    stopColor="rgba(0, 0, 255, 0.8)"
                                  />
                                  <stop
                                    offset="50%"
                                    stopColor="rgba(0, 0, 255, 0.5)"
                                  />
                                  <stop
                                    offset="100%"
                                    stopColor="rgba(0, 0, 255, 0.3)"
                                  />
                                </linearGradient>
                              </defs>

                              {/* 内側の回転する円 */}
                              <circle
                                cx="0"
                                cy="0"
                                r="17"
                                stroke={`url(#blue-gradient-${node.index})`}
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
                                  animation:
                                    "waveExpand 2.5s ease-out infinite",
                                }}
                              />
                            </>
                          )}

                          {/* フレンドが所有しているゲーム */}
                          {!isMyOwned && isFriedOwned && (
                            <>
                              {/* グラデーション定義 */}
                              <defs>
                                <linearGradient
                                  id={`yellow-gradient-${node.index}`}
                                  x1="0%"
                                  y1="0%"
                                  x2="100%"
                                  y2="100%"
                                >
                                  <stop
                                    offset="0%"
                                    stopColor="rgba(255, 255, 0, 0.8)"
                                  />
                                  <stop
                                    offset="50%"
                                    stopColor="rgba(255, 255, 0, 0.5)"
                                  />
                                  <stop
                                    offset="100%"
                                    stopColor="rgba(255, 255, 0, 0.3)"
                                  />
                                </linearGradient>
                              </defs>

                              {/* 内側の回転する円 */}
                              <circle
                                cx="0"
                                cy="0"
                                r="17"
                                stroke={`url(#yellow-gradient-${node.index})`}
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
                                  animation:
                                    "waveExpand 2.5s ease-out infinite",
                                }}
                              />
                            </>
                          )}
                        </g>
                      )}
                  </g>
                );
              })}

            {tooltip.index !== -1 && (
              <g>
                {selectedLinks.map((link, index) => {
                  if (index !== tooltip.index) return null;
                  const gameIndex =
                    link.source.index === selectedIndex
                      ? link.target.index
                      : link.source.index;
                  const node: NodeType = nodes[gameIndex];
                  return (
                    <g
                      transform={`translate(${tooltip.x},${tooltip.y})`}
                      key={`tooltip-${index}`}
                    >
                      <Popup node={node} link={link} />
                    </g>
                  );
                })}
              </g>
            )}

            {/* ホバー時のツールチップを追加 */}
            {hoveredIndex !== -1 && (
              <GameTooltip
                videoUrls={
                  nodes.find((node) => node.index === hoveredIndex)
                    ?.mp4Movies || []
                }
                screenshots={
                  nodes.find((node) => node.index === hoveredIndex)
                    ?.screenshots || []
                }
                imgURL={
                  nodes.find((node) => node.index === hoveredIndex)?.imgURL ||
                  ""
                }
                price={
                  nodes.find((node) => node.index === hoveredIndex)?.price || 0
                }
                title={
                  nodes.find((node) => node.index === hoveredIndex)?.title ||
                  "Unknown"
                }
                tags={
                  nodes.find((node) => node.index === hoveredIndex)?.tags || []
                }
                x={nodes.find((node) => node.index === hoveredIndex)?.x || 0}
                y={nodes.find((node) => node.index === hoveredIndex)?.y || 0}
                transform={transform}
                setHoveredIndex={setHoveredIndex}
                index={hoveredIndex}
              />
            )}
          </>
        )}
      </ZoomableSVG>
    </div>
  );
};

export default NodeLink;
