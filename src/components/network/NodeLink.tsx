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
      .scaleExtent([0.1, 10]) 
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

      const initialTransform = d3.zoomIdentity.translate(window.innerWidth / 2 - centerX, window.innerHeight / 2 - centerY).scale(transform.k);
      svg.call(zoom.current.transform, initialTransform);
      setTransform(initialTransform);
    }
  }, [centerX, centerY]);

  return (
    <svg ref={svgRef} width={window.innerWidth} height={window.innerHeight}>
      <g transform={`translate(${transform.x - window.innerWidth / 5},${transform.y})scale(${transform.k})`}>
        {children}
      </g>
    </svg>
  );
};

const NodeLink = (props: any) => {
  const { nodes, links, centerX, centerY } = props;

  return (
    <ZoomableSVG centerX={centerX} centerY={centerY}>
      {links.length !== 0 &&
        links.map((link: any, i: number) => (
          <line
            key={i}
            className="link"
            x1={link.source.x}
            y1={link.source.y}
            x2={link.target.x}
            y2={link.target.y}
            style={{ stroke: "white", strokeWidth: "0.5" }}
          />
        ))}
      {nodes.length !== 0 &&
        nodes.map((node: any, i: any) => {
          return (
            <g transform={`translate(${node.x},${node.y})`} key={i}>
              <Icon
                title={node.title}
                imgURL={node.imgURL}
                index={node.index}
                steamGameId={node.steamGameId}
                twitchGameId={node.twitchGameId}
                circleScale={node.circleScale}
              ></Icon>
            </g>
          );
        })}
    </ZoomableSVG>
  );
};

export default NodeLink;
