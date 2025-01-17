"use client";
import { useState, useEffect, useRef, ReactNode, useMemo } from "react";
import * as d3 from "d3";
import Icon from "./Icon";
import { LinkType, NodeType, StreamerListType } from "@/types/NetworkType";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { fetcher } from "../common/Fetcher";
import { ISR_FETCH_INTERVAL } from "@/constants/DetailsConstants";
import Popup from "./Popup";

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
  children: ReactNode;
  centerX: number;
  centerY: number;
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
        {children}
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

  const findHoveredNode = (index: number) => {
    return nodes.find((node: NodeType) => node.index === index);
  };

  const similarGamesLinkList = links.filter((link: LinkType) => {
    const isSourceSelected = link.source.index === selectedIndex;
    const isTargetSelected = link.target.index === selectedIndex;
    return isSourceSelected || isTargetSelected;
  });

  const linkScale = d3.scaleLinear().domain([0, 50, 100]).range([0, 0.1, 2]);

  const popups = useMemo(() => {
    if (similarGamesLinkList.length === 0) return null;

    return similarGamesLinkList.map((link: LinkType) => {
      const gameIndex =
        link.source.index === selectedIndex
          ? link.target.index
          : link.source.index;
      const node: NodeType = nodes[gameIndex];
      const isHovered = gameIndex === hoveredIndex;

      if (!isHovered) return null;

      // 一意なキーを生成（Linkにidがある場合はそれを使用）
      const uniqueKey = link.index
        ? `popup-${link.index}`
        : `popup-${link.source.index}-${link.target.index}`;

      return (
        <g key={uniqueKey} transform={`translate(${node.x},${node.y})`}>
          <Popup node={node} link={link} />
        </g>
      );
    });
  }, [similarGamesLinkList, selectedIndex, hoveredIndex, nodes]);

  return (
    <ZoomableSVG centerX={centerX} centerY={centerY}>
      <>
        {links.length !== 0 &&
          links.map((link: LinkType, i: number) => {
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
                  stroke: isHovered ? "orange" : isSelected ? "cyan" : "white",
                  strokeWidth:
                    isHovered || isSelected
                      ? Math.max(linkScale(link.similarity as number), 0.1) + 1
                      : Math.max(linkScale(link.similarity as number), 0.1),
                }}
              />
            );
          })}
        {nodes.length !== 0 &&
          nodes.map((node: NodeType, i: number) => {
            const streamerColors = streamerIds
              .filter((game: StreamerListType) =>
                game.videoId.some((id) => id === node.twitchGameId)
              )
              .map((game: { color: string }) => game.color); // 配信者の色をすべて取得

            // それぞれの色を等間隔で分けるための角度計算
            const angleStep =
              streamerColors.length > 0 ? 360 / streamerColors.length : 0;
            const isHovered = node.index === hoveredIndex;
            const isHighlight = selectedTags.length
              ? selectedTags.every((tag) => node.tags?.includes(tag))
              : false;
            const isMyOwned =
              myOwnGames &&
              myOwnGames.some((value) => node.title === value.title);
            const isFriedOwned =
              friendsOwnGames &&
              friendsOwnGames.some((value) => node.title === value.gameName);
            return (
              <g
                transform={`translate(${node.x},${node.y})`}
                onMouseEnter={() => setHoveredIndex(node.index ?? -1)}
                onMouseLeave={() => setHoveredIndex(-1)}
                onClick={() => setSelectedIndex(node.index)}
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
                  similarGamesLinkList={similarGamesLinkList}
                />
                {/* 色付きセグメントを描画 配信者による強調 */}
                {openPanel === "streamer" &&
                  streamerColors.length > 0 &&
                  streamerColors.map((color: string, index: number) => {
                    const angleStart = -90 + angleStep * index; // -90は真上

                    return (
                      <g transform={`scale(${node.circleScale})`} key={index}>
                        <circle
                          key={index}
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

                {openPanel === "highlight" && isHighlight && (
                  <g transform={`scale(${node.circleScale})`}>
                    {/* グラデーション定義 */}
                    <defs>
                      <linearGradient
                        id={`strong-gradient-${node.index}`}
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="#ff0000" />{" "}
                        {/* 明るい赤 */}
                        <stop offset="50%" stopColor="#ff4d4d" />{" "}
                        {/* 少し薄い赤 */}
                        <stop offset="100%" stopColor="#ff9999" />{" "}
                        {/* 淡い赤 */}
                      </linearGradient>
                    </defs>

                    {/* 内側の回転する円 */}
                    <circle
                      cx="0"
                      cy="0"
                      r="17"
                      stroke={`url(#strong-gradient-${node.index})`}
                      strokeWidth="3"
                      fill="transparent"
                      style={{
                        animation: "fastRotate 1.5s linear infinite",
                      }}
                    />

                    {/* 外側の波動のような円 */}
                    <circle
                      cx="0"
                      cy="0"
                      r="17"
                      stroke="rgba(255, 77, 77, 0.5)"
                      strokeWidth="2"
                      fill="transparent"
                      style={{
                        animation: "waveExpand 2s ease-out infinite",
                      }}
                    />
                  </g>
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
                              animation: "waveExpand 2.5s ease-out infinite",
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
                              animation: "waveExpand 2.5s ease-out infinite",
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
                              animation: "waveExpand 2.5s ease-out infinite",
                            }}
                          />
                        </>
                      )}
                    </g>
                  )}
              </g>
            );
          })}

        {popups}
        {hoveredIndex !== -1 && findHoveredNode(hoveredIndex) && (
          <g
            transform={`translate(${findHoveredNode(hoveredIndex)?.x},${
              findHoveredNode(hoveredIndex)?.y
            })`}
          >
            <g>
              <text
                x={0}
                y={80}
                textAnchor="middle"
                fill="white"
                fontSize="30px"
                pointerEvents="none"
                style={{
                  textShadow: `
                        -1px -1px 0 #000,
                        1px -1px 0 #000,
                        -1px 1px 0 #000,
                        1px 1px 0 #000,
                        -1px 0 0 #000,
                        1px 0 0 #000,
                        0 -1px 0 #000,
                        0 1px 0 #000
                      `,
                }}
              >
                {findHoveredNode(hoveredIndex)?.title}
              </text>
            </g>
          </g>
        )}
      </>
    </ZoomableSVG>
  );
};

export default NodeLink;
