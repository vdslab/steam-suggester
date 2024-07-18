"use client";

import { useState, useEffect, useRef } from "react";
import * as d3 from 'd3';
import Icon from "./Icon";
import createNetwork from "@/hooks/createNetwork";

const ZoomableSVG = (props:any) => {
  const { children } = props;

  const svgRef = useRef<SVGSVGElement>(null);
  const [k, setK] = useState(1);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);

  useEffect(() => {
    const zoom = d3.zoom().on("zoom", (event:any) => {
      const { x, y, k } = event.transform;
      setX(x);
      setY(y);
      setK(k);
    });
    d3.select(svgRef.current).call(zoom);
  }, []);
  return (
    <svg ref={svgRef} width={window.innerWidth} height={window.innerHeight}>
      <g transform={`translate(${x + 300},${y + 200})scale(${k - 0.5})`}>
        {children}
      </g>
    </svg>
  );
};

const NodeLink = (props:any) => {
  const { filter } = props;

  const [nodes, setNodes] = useState<any>([]);
  const [links, setLinks] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const {nodes, links} = await createNetwork();
      setNodes(nodes);
      setLinks(links);
      setIsLoading(false);
    })();
    
  }, [filter]);

  return (
    <div>
      {!isLoading ? <ZoomableSVG>
        {links.length !== 0 &&
          links.map((link:any, i) => (
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
          nodes.map((node:any, i:any) => {
            return (
              <g transform={`translate(${node.x},${node.y})`} key={i}>
                <Icon
                  title={node.title}
                  imgURL={node.imgURL}
                  index={node.index}
                  steamGameId={node.steamGameId}
                  twitchGameId={node.twitchGameId}
                ></Icon>
              </g>
            );
          })}
      </ZoomableSVG> : <div>Loading...</div>
      }
    </div>
  );
};

export default NodeLink;