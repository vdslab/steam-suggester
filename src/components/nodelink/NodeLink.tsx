"use client";
import { useState, useEffect, useRef, useMemo } from "react";
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
import HighlightSteamList from "./highlight/HighlightSteamList";

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

type LinkWithLevel = LinkType & { level: number; from: NodeType; to: NodeType };

const ZoomableSVG: React.FC<ZoomableSVGProps> = ({
  children,
  centerX,
  centerY,
}) => {
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
      .on("zoom", (event) => {
        setTransform(event.transform);
      })
      .on("end", () => {
        if (svgRef.current) {
          d3.select(svgRef.current).style("cursor", "grab");
        }
      });

    if (svgRef.current) {
      d3.select(svgRef.current).call(zoom.current);
    }
  }, []);

  // 初期位置へトランジション
  useEffect(() => {
    if (svgRef.current && zoom.current) {
      const svg = d3.select(svgRef.current);

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

function animatePath(
  pathElement: SVGPathElement | null,
  duration: number,
  delay: number
) {
  if (!pathElement) return;
  const totalLength = pathElement.getTotalLength();

  d3.select(pathElement)
    .attr("stroke-dasharray", totalLength)
    .attr("stroke-dashoffset", totalLength)
    .transition()
    .duration(duration)
    .delay(delay)
    .ease(d3.easeLinear)
    .attr("stroke-dashoffset", 0);
}

function buildAdjacencyList(
  nodes: NodeType[],
  links: LinkType[]
): Map<number, LinkType[]> {
  const adjacency = new Map<number, LinkType[]>();

  links.forEach((link) => {
    const sIdx = link.source.index ?? -1;
    const tIdx = link.target.index ?? -1;

    if (!adjacency.has(sIdx)) adjacency.set(sIdx, []);
    if (!adjacency.has(tIdx)) adjacency.set(tIdx, []);

    adjacency.get(sIdx)!.push(link);
    adjacency.get(tIdx)!.push(link);
  });

  return adjacency;
}

function getBfsEdgesAllComponents(
  nodes: NodeType[],
  links: LinkType[]
): { bfsEdges: LinkWithLevel[]; leftoverEdges: LinkType[] } {
  if (nodes.length === 0) return { bfsEdges: [], leftoverEdges: links };

  const adjacency = buildAdjacencyList(nodes, links);
  const visited = new Set<number>();
  const bfsEdges: LinkWithLevel[] = [];

  // 全ノードを index 昇順にループし、未訪問ノードがあればその連結成分を BFS
  for (let i = 0; i < nodes.length; i++) {
    const nodeIndex = nodes[i].index ?? -1;
    if (nodeIndex < 0) continue;

    if (!visited.has(nodeIndex)) {
      // 未訪問のノードがあれば BFS 開始
      bfsFrom(nodeIndex, adjacency, visited, bfsEdges, nodes);
    }
  }

  // BFS 辺に含まれなかったものは leftover
  const leftoverEdges = links.filter(
    (l) =>
      !bfsEdges.some(
        (bfsLink) =>
          (bfsLink.source.index === l.source.index &&
            bfsLink.to.index === l.target.index) ||
          (bfsLink.source.index === l.target.index &&
            bfsLink.to.index === l.source.index)
      )
  );

  return { bfsEdges, leftoverEdges };
}

function bfsFrom(
  startIndex: number,
  adjacency: Map<number, LinkType[]>,
  visited: Set<number>,
  bfsEdges: LinkWithLevel[],
  nodes: NodeType[]
) {
  visited.add(startIndex);
  const queue: Array<{ node: number; level: number }> = [];
  const nodeLevels = new Map<number, number>();

  queue.push({ node: startIndex, level: 0 });
  nodeLevels.set(startIndex, 0);

  while (queue.length > 0) {
    const { node, level } = queue.shift()!;
    const neighborLinks = adjacency.get(node) || [];

    for (const link of neighborLinks) {
      const sIdx = link.source.index ?? -1;
      const tIdx = link.target.index ?? -1;

      const neighbor = sIdx === node ? tIdx : sIdx;

      if (neighbor !== -1 && !visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push({ node: neighbor, level: level + 1 });
        nodeLevels.set(neighbor, level + 1);

        // Find nodes by index
        const fromNode = nodes.find((n) => n.index === node);
        const toNode = nodes.find((n) => n.index === neighbor);

        if (fromNode && toNode) {
          bfsEdges.push({
            ...link,
            level: level + 1,
            from: fromNode,
            to: toNode,
          });
        }
      }
    }
  }
}

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

  // Steam 所有ゲーム情報取得
  const { data: myOwnGames, error: myGamesError } = useSWR<
    GetSteamOwnedGamesResponse[]
  >(
    status === "authenticated" && steamId
      ? `${process.env.NEXT_PUBLIC_CURRENT_URL}/api/network/getSteamOwnedGames?steamId=${steamId}`
      : null,
    fetcher,
    { refreshInterval: ISR_FETCH_INTERVAL }
  );
  const { data: friendsOwnGames, error: friendsGamesError } = useSWR<
    GetFriendGamesResponse[]
  >(
    status === "authenticated" && steamId
      ? `${process.env.NEXT_PUBLIC_CURRENT_URL}/api/network/getFriendGames?steamId=${steamId}`
      : null,
    fetcher,
    { refreshInterval: ISR_FETCH_INTERVAL }
  );

  const { bfsEdges, leftoverEdges } = useMemo(() => {
    return getBfsEdgesAllComponents(nodes, links);
  }, [nodes, links]);

  const selectedLinks = useMemo(() => {
    return links.filter(
      (link) =>
        link.source.index === selectedIndex ||
        link.target.index === selectedIndex
    );
  }, [links, selectedIndex]);

  useEffect(() => {
    if (selectedIndex !== -1) {
      const selectedNode = nodes.find((node) => node.index === selectedIndex);
      setBackground(selectedNode?.background ?? "");
    } else {
      setBackground("");
    }
  }, [selectedIndex, nodes]);

  const bfsPathRefs = useRef<Array<SVGPathElement | null>>([]);
  const [showLeftover, setShowLeftover] = useState(false);

  useEffect(() => {
    // 最大レベルを取得
    const maxLevel = Math.max(...bfsEdges.map((link) => link.level), 0);

    if (maxLevel === 0) {
      // エッジがない場合はすぐに leftover を表示
      setShowLeftover(true);
      return;
    }

    // 全体のアニメーション時間を2秒に設定
    const totalDuration = 3000; // ms
    const perLevelDuration = maxLevel > 0 ? totalDuration / maxLevel : 0;

    // エッジをレベル順にソート
    const sortedBfsEdges = [...bfsEdges].sort((a, b) => a.level - b.level);

    sortedBfsEdges.forEach((link, i) => {
      const delay = link.level * perLevelDuration;
      const pathIndex = bfsEdges.indexOf(link);
      const pathEl = bfsPathRefs.current[pathIndex];
      animatePath(pathEl, perLevelDuration, delay);
    });

    // アニメーション完了後に leftoverEdges を表示
    const timer = setTimeout(() => {
      setShowLeftover(true);
    }, totalDuration + 100); // 余裕を持って100ms追加

    return () => clearTimeout(timer);
  }, [bfsEdges]);

  const linkScale = useMemo(() => {
    return d3.scaleLinear().domain([0, 50, 100]).range([0, 0.1, 2]);
  }, []);
  const colorScale = useMemo(() => {
    return d3
      .scaleLinear<string>()
      .domain([0, 50, 100])
      .range(["red", "yellow", "green"]);
  }, []);

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
        transition: "background-image 0.5s ease",
      }}
    >
      <ZoomableSVG centerX={centerX} centerY={centerY}>
        {(transform) => (
          <>
            {bfsEdges.map((link, i) => {
              const sIdx = link.from.index ?? -1;
              const tIdx = link.to.index ?? -1;
              const isHovered =
                (sIdx === hoveredIndex && tIdx === selectedIndex) ||
                (sIdx === selectedIndex && tIdx === hoveredIndex);
              const isSelected =
                sIdx === selectedIndex || tIdx === selectedIndex;

              // path 座標 (from -> to)
              const d = `M${link.from.x},${link.from.y} L${link.to.x},${link.to.y}`;
              const strokeColor = isHovered
                ? "orange"
                : isSelected
                ? "cyan"
                : "white";
              const strokeW =
                isHovered || isSelected
                  ? Math.max(linkScale(link.similarity ?? 0), 0.1) + 1
                  : Math.max(linkScale(link.similarity ?? 0), 0.1);

              return (
                <path
                  key={`bfsEdge-${i}`}
                  d={d}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeW}
                  ref={(el) => {
                    bfsPathRefs.current[i] = el;
                  }}
                />
              );
            })}

            {leftoverEdges.map((link, i) => {
              const sIdx = link.source.index ?? -1;
              const tIdx = link.target.index ?? -1;
              const isHovered =
                (sIdx === hoveredIndex && tIdx === selectedIndex) ||
                (sIdx === selectedIndex && tIdx === hoveredIndex);
              const isSelected =
                sIdx === selectedIndex || tIdx === selectedIndex;

              const d = `M${link.source.x},${link.source.y} L${link.target.x},${link.target.y}`;
              const strokeColor = isHovered
                ? "orange"
                : isSelected
                ? "cyan"
                : "white";
              const strokeW =
                isHovered || isSelected
                  ? Math.max(linkScale(link.similarity ?? 0), 0.1) + 1
                  : Math.max(linkScale(link.similarity ?? 0), 0.1);

              return (
                <path
                  key={`leftoverEdge-${i}`}
                  d={d}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeW}
                  style={{
                    opacity: showLeftover ? 1 : 0,
                    transition: "opacity 500ms ease-in",
                  }}
                />
              );
            })}

            {nodes.map((node: NodeType, i: number) => {
              const isHovered = node.index === hoveredIndex;
              return (
                <g
                  key={`node-${i}`}
                  transform={`translate(${node.x},${node.y})`}
                  onMouseEnter={() => setHoveredIndex(node.index ?? -1)}
                  onMouseLeave={() => setHoveredIndex(-1)}
                  onClick={() => {
                    if (selectedIndex !== node.index) {
                      setSelectedIndex(node.index ?? i);
                      setHoveredIndex(-1);
                    }
                  }}
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

                  {/* パネルによる強調 */}
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
                  const node: NodeType | undefined = nodes.find(
                    (n) => n.index === gameIndex
                  );
                  if (!node) return null;
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

            {/* ノードホバー時のゲームツールチップ */}
            {hoveredIndex !== -1 && (
              <GameTooltip
                videoUrls={
                  nodes.find((n) => n.index === hoveredIndex)?.mp4Movies || []
                }
                screenshots={
                  nodes.find((n) => n.index === hoveredIndex)?.screenshots || []
                }
                imgURL={
                  nodes.find((n) => n.index === hoveredIndex)?.imgURL || ""
                }
                price={nodes.find((n) => n.index === hoveredIndex)?.price || 0}
                title={
                  nodes.find((n) => n.index === hoveredIndex)?.title ||
                  "Unknown"
                }
                tags={nodes.find((n) => n.index === hoveredIndex)?.tags || []}
                x={nodes.find((n) => n.index === hoveredIndex)?.x || 0}
                y={nodes.find((n) => n.index === hoveredIndex)?.y || 0}
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
