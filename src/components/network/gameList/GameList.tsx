"use client";

import { NodeType } from "@/types/NetworkType";
import { useState } from "react";

type Props = {
  nodes: NodeType[];
}

const GameList = (props: any) => {
  const { nodes, setCenterX, setCenterY } = props;
  const [hoveredGameIdx, setHoveredGameIdx] = useState<number>(-1);

  const handleMouseEnter = (index: number) => {
    setHoveredGameIdx(index);
  }

  const handleMouseLeave = () => {
    setHoveredGameIdx(-1);
  }

  const handleMouseClick = (index: number) => {
    setCenterX(nodes[index].x);
    setCenterY(nodes[index].y);
  }

  return (
    <div style={{ maxHeight: '92vh', overflowY: 'auto', paddingBottom: '120px'}}>
      {nodes.map((node: NodeType, index: number) => {
          return <div 
          className={`cursor-pointer text-slate-${hoveredGameIdx === index ? 50 : 300} pb-2`}
          onMouseEnter={() => handleMouseEnter(index)}
          onMouseLeave={() => handleMouseLeave()}
          onClick={() => handleMouseClick(index)}
          key={index}
          >
            {node.title}
          </div>
      })}
    </div>
  );
};

export default GameList;
