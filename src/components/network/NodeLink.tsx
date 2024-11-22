"use client";
import { useState, useEffect, useRef } from "react";
import * as d3 from 'd3';
import Icon from "./Icon";
import { NodeType } from "@/types/NetworkType";
import { StreamerListType } from "@/types/StreamerType"; // 必要な型をインポート

interface NodeLinkProps {
  nodes: NodeType[];
  links: any[]; // 適切な型に置き換えてください
  centerX: number;
  centerY: number;
  setSelectedIndex: (index: number) => void;
  streamerIds: StreamerListType[];
}

const ZoomableSVG = (props: any) => {
  const { children, centerX, centerY } = props;
  const svgRef = useRef<SVGSVGElement>(null);
  const [transform, setTransform] = useState(d3.zoomIdentity);

  const zoom = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  useEffect(() => {
    zoom.current = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 4]) 
      .on("zoom", (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        setTransform(event.transform);
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
        .translate(window.innerWidth / 2 - window.innerWidth / 5 - centerX, window.innerHeight / 2 - centerY)
        .scale(1);
      svg.transition()
        .duration(1200)
        .call(zoom.current.transform, initialTransform)
        .on('end', () => {
          setTransform(initialTransform);
        });
    }
  }, [centerX, centerY]);

  return (
    <svg ref={svgRef} width={window.innerWidth} height={window.innerHeight}>
      <g transform={`translate(${transform.x},${transform.y})scale(${transform.k})`}>
        {children}
      </g>
    </svg>
  );
};

const NodeLink: React.FC<NodeLinkProps> = ({
  nodes,
  links,
  centerX,
  centerY,
  setSelectedIndex,
  streamerIds = [], // デフォルト値を設定
}) => {

  const [hoveredIndex, setHoveredIndex] = useState<number>(-1);

  const findHoveredNode = () => {
    return nodes.find((node: NodeType) => node.index === hoveredIndex);
  };

  // ウィンドウサイズの状態を管理
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    }
  }, []);

  return (
    <ZoomableSVG centerX={centerX} centerY={centerY}>
      <>
        {links.length > 0 &&
          links.map((link: any, i: number) => {
            const isHovered = link.source.index === hoveredIndex || link.target.index === hoveredIndex;
            return (
              <line
                key={`link-${i}`}
                className="link"
                x1={link.source.x}
                y1={link.source.y}
                x2={link.target.x}
                y2={link.target.y}
                style={{
                  stroke: isHovered ? "cyan" : "white",
                  strokeWidth: isHovered ? "2" : "1"
                }}
              />
            );
          })
        }
        {nodes.length > 0 &&
          nodes.map((node: NodeType, i: number) => {
            const streamerColors = streamerIds
              ?.filter((game: StreamerListType) =>
                game.videoId.some((id: string) => id === node.twitchGameId)
              )
              .map((game) => game.color) || [];

            const angleStep = streamerColors.length > 0 ? 360 / streamerColors.length : 0;

            return (
              <g
                key={`node-${i}`}
                className={`brightness-${hoveredIndex === node.index ? "125" : "100"}`}
                transform={`translate(${node.x},${node.y})`}
                onMouseEnter={() => setHoveredIndex(node.index ?? -1)}
                onMouseLeave={() => setHoveredIndex(-1)}
              >
                <Icon
                  title={node.title}
                  imgURL={node.imgURL}
                  index={node.index ?? i}
                  steamGameId={node.steamGameId}
                  twitchGameId={node.twitchGameId}
                  circleScale={node.circleScale ?? 1}
                  suggestValue={node.suggestValue}
                />
                {/* 色付きセグメントを描画 */}
                {streamerColors.length > 0 &&
                  streamerColors.map((color: string, index: number) => {
                    const angleStart = -90 + angleStep * index; // -90は真上
                    return (
                      <circle
                        key={`color-${index}`}
                        cx="0"
                        cy="0"
                        r="50" // 半径
                        stroke={color}
                        strokeWidth="10"
                        fill="transparent"
                        strokeDasharray={`${angleStep} ${360 - angleStep}`}
                        strokeDashoffset={-angleStart}
                      />
                    );
                  })
                }
              </g>
            );
          })
        }
        {hoveredIndex !== -1 && findHoveredNode() && (
          <g transform={`translate(${findHoveredNode().x},${findHoveredNode().y})`}>
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
                  `
                }}
              >
                {findHoveredNode()?.title}
              </text>
            </g>
          </g>
        )}
      </>
    </ZoomableSVG>
  );
};

export default NodeLink;
