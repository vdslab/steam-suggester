// components/SelectedLinks.tsx
import React from "react";
import { LinkType, NodeType } from "@/types/NetworkType";
import * as d3 from "d3";

const DEFAULT_TOOLTIP = {
  index: -1,
  x: 0,
  y: 0,
};

type TooltipType = {
  index: number;
  x: number;
  y: number;
};

type SelectedLinksProps = {
  selectedLinks: LinkType[];
  hoveredIndex: number;
  selectedIndex: number;
  linkScale: d3.ScaleLinear<number, number>;
  colorScale: d3.ScaleLinear<string, string>;
  setTooltip: React.Dispatch<React.SetStateAction<TooltipType>>;
};

const SelectedLinks: React.FC<SelectedLinksProps> = React.memo(
  ({
    selectedLinks,
    hoveredIndex,
    selectedIndex,
    linkScale,
    colorScale,
    setTooltip,
  }) => {
    return (
      <g>
        {selectedLinks.map((link: LinkType, i: number) => {
          const isHovered =
            (link.source.index === hoveredIndex &&
              link.target.index === selectedIndex) ||
            (link.source.index === selectedIndex &&
              link.target.index === hoveredIndex);

          // エッジの中点とオフセットを計算
          const sourceX = link.source.x as number;
          const sourceY = link.source.y as number;
          const targetX = link.target.x as number;
          const targetY = link.target.y as number;

          const sourceRadius = 17 * (link.source.circleScale ?? 1);
          const targetRadius = 17 * (link.target.circleScale ?? 1);

          const deltaX = targetX - sourceX;
          const deltaY = targetY - sourceY;
          const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);

          const normalizedX = deltaX / distance;
          const normalizedY = deltaY / distance;

          const adjustedSourceX = sourceX + normalizedX * sourceRadius;
          const adjustedSourceY = sourceY + normalizedY * sourceRadius;
          const adjustedTargetX = targetX - normalizedX * targetRadius;
          const adjustedTargetY = targetY - normalizedY * targetRadius;

          const midX = (adjustedSourceX + adjustedTargetX) / 2;
          const midY = (adjustedSourceY + adjustedTargetY) / 2;

          const offset = 20;
          const perpendicularX = -normalizedY;
          const perpendicularY = normalizedX;
          const textX = midX + perpendicularX * offset;
          const textY = midY + perpendicularY * offset;

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
                    Math.max(linkScale(link.similarity as number), 0.1) + 1,
                }}
              />

              {/* エッジスコアの表示 */}
              {link.similarity !== undefined && (
                <g
                  className="edge-score-group"
                  transform={`translate(${textX}, ${textY})`}
                >
                  <g
                    onMouseEnter={() =>
                      setTooltip({
                        index: i,
                        x: textX,
                        y: textY,
                      })
                    }
                    onMouseLeave={() => setTooltip(DEFAULT_TOOLTIP)}
                    style={{ cursor: "pointer" }}
                  >
                    <text
                      x={0}
                      y={0}
                      textAnchor="middle"
                      alignmentBaseline="middle"
                      fill={colorScale(link.similarity)}
                      fontSize="24px"
                      fontWeight="bold"
                      className="edge-score"
                      textDecoration="underline"
                      style={{
                        textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
                      }}
                    >
                      {link.similarity}%
                    </text>
                  </g>
                </g>
              )}
            </g>
          );
        })}
      </g>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.selectedLinks === nextProps.selectedLinks &&
      prevProps.hoveredIndex === nextProps.hoveredIndex &&
      prevProps.selectedIndex === nextProps.selectedIndex &&
      prevProps.linkScale === nextProps.linkScale &&
      prevProps.colorScale === nextProps.colorScale &&
      prevProps.setTooltip === nextProps.setTooltip
    );
  }
);

export default SelectedLinks;
