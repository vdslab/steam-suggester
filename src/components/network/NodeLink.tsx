"use client";
import { useState, useEffect, useRef } from "react";
import * as d3 from 'd3';
import Icon from "./Icon";

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

      const initialTransform = d3.zoomIdentity.translate(window.innerWidth / 2 - window.innerWidth / 5 - centerX, window.innerHeight / 2 - centerY).scale(1);
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

const NodeLink = (props: any) => {
  const { nodes, links, centerX, centerY } = props;

  const [hoveredIndex, setHoveredIndex] = useState<number>(-1);

  return (
    <ZoomableSVG centerX={centerX} centerY={centerY}>
       <>
          {links.length !== 0 &&
            links.map((link: any, i: number) => {
              const isHovered = link.source.id === hoveredIndex || link.target.id === hoveredIndex;
              return (
                <line
                  key={i}
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
              )
            })
          }
          {nodes.length !== 0 &&
            nodes.map((node: any, i: number) => (
              <g transform={`translate(${node.x},${node.y})`}
                 onMouseEnter={() => setHoveredIndex(i)}
                 onMouseLeave={() => setHoveredIndex(-1)}
                 key={i}>
                <Icon
                  title={node.title}
                  imgURL={node.imgURL}
                  index={node.index}
                  steamGameId={node.steamGameId}
                  twitchGameId={node.twitchGameId}
                  circleScale={node.circleScale}
                />
              </g>
            ))}
          {hoveredIndex !== -1 && (
            <g transform={`translate(${nodes[hoveredIndex].x},${nodes[hoveredIndex].y})`}>
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
                  {nodes[hoveredIndex].title}
                </text>
              </g>
            </g>
          )}
        </>

    </ZoomableSVG>
  );
};

export default NodeLink;
