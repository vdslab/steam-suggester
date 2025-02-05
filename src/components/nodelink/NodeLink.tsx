"use client";
import { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import Icon from "./Icon";
import { LinkType, NodeType, StreamerListType } from "@/types/NetworkType";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { fetcher } from "../common/Fetcher";
import Popup from "./Popup";
import GameTooltip from "./GameTooltip";
import HighlightStreamer from "./highlight/HighlightStreamer";
import HighlightTag from "./highlight/HighlightTag";
import HighlightSteamList from "./highlight/HighlightSteamList";
import NonSelectedLinks from "./parts/NonSelectedLinks";
import SelectedLinks from "./parts/SelectedLinks";
import { startsWith } from "../common/Utils";

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
  );

  // フレンドの所有ゲームを取得
  const { data: friendsOwnGames, error: friendsGamesError } = useSWR<
    GetFriendGamesResponse[]
  >(
    status === "authenticated" && steamId
      ? `${process.env.NEXT_PUBLIC_CURRENT_URL}/api/network/getFriendGames?steamId=${steamId}`
      : null,
    fetcher,
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
    .range(["red", "yellow", "lime"]);

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
            <NonSelectedLinks
              nonSelectedLinks={nonSelectedLinks}
              hoveredIndex={hoveredIndex}
              selectedIndex={selectedIndex}
              linkScale={linkScale}
            />

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
                      isHovered={isHovered}
                      selectedIndex={selectedIndex}
                      similarGamesLinkList={selectedLinks}
                    />
                    {/* 色付きセグメントを描画 配信者による強調 */}
                    {startsWith(openPanel, "streamer") && (
                      <HighlightStreamer
                        streamerIds={streamerIds}
                        twitchGameId={node.twitchGameId}
                        circleScale={node.circleScale}
                      />
                    )}

                    {startsWith(openPanel, "highlight") && (
                      <HighlightTag
                        tags={node.tags || []}
                        selectedTags={selectedTags}
                        circleScale={node.circleScale}
                        index={node.index}
                      />
                    )}

                    {startsWith(openPanel, "steamList") && (
                      <HighlightSteamList
                        myGamesError={myGamesError}
                        friendsGamesError={friendsGamesError}
                        myOwnGames={myOwnGames}
                        friendsOwnGames={friendsOwnGames}
                        circleScale={node.circleScale}
                        index={node.index}
                        title={node.title}
                      />
                    )}
                  </g>
                );
              })}

            {/* 選択エッジとスコアを描画 */}
            <SelectedLinks
              selectedLinks={selectedLinks}
              hoveredIndex={hoveredIndex}
              selectedIndex={selectedIndex}
              linkScale={linkScale}
              colorScale={colorScale}
              setTooltip={setTooltip}
            />

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
                        tags={node.tags || []}
                        selectedTags={selectedTags}
                        circleScale={node.circleScale}
                        index={node.index}
                      />
                    )}

                    {openPanel === "steamList" && (
                      <HighlightSteamList
                        myGamesError={myGamesError}
                        friendsGamesError={friendsGamesError}
                        myOwnGames={myOwnGames}
                        friendsOwnGames={friendsOwnGames}
                        circleScale={node.circleScale}
                        index={node.index}
                        title={node.title}
                      />
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
