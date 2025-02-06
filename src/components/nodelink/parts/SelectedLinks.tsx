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
    // 長方形ノードの境界との交点を計算するヘルパー関数
    const getRectIntersection = (
      cx: number,
      cy: number,
      halfWidth: number,
      halfHeight: number,
      dx: number,
      dy: number
    ) => {
      const tX = halfWidth / Math.abs(dx);
      const tY = halfHeight / Math.abs(dy);
      const t = Math.min(tX, tY);
      return {
        x: cx + dx * t,
        y: cy + dy * t,
      };
    };

    return (
      <>
        <g>
          {/* グロー効果の定義 */}
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {selectedLinks.map((link: LinkType, i: number) => {
            const isHovered =
              (link.source.index === hoveredIndex &&
                link.target.index === selectedIndex) ||
              (link.source.index === selectedIndex &&
                link.target.index === hoveredIndex);

            // ノード中心座標
            const sourceX = link.source.x as number;
            const sourceY = link.source.y as number;
            const targetX = link.target.x as number;
            const targetY = link.target.y as number;

            // 仮のベースサイズ設定
            const baseHalfWidth = 37;
            const baseHalfHeight = 20;

            // ノードの大きさは circleScale で調整
            const sourceHalfWidth =
              baseHalfWidth * (link.source.circleScale ?? 1);
            const sourceHalfHeight =
              baseHalfHeight * (link.source.circleScale ?? 1);
            const targetHalfWidth =
              baseHalfWidth * (link.target.circleScale ?? 1);
            const targetHalfHeight =
              baseHalfHeight * (link.target.circleScale ?? 1);

            // ソースからターゲットへの方向ベクトル
            const deltaX = targetX - sourceX;
            const deltaY = targetY - sourceY;
            const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);

            if (distance === 0) return null;
            const normalizedX = deltaX / distance;
            const normalizedY = deltaY / distance;

            // ノードの境界との交点を計算
            const sourceIntersection = getRectIntersection(
              sourceX,
              sourceY,
              sourceHalfWidth,
              sourceHalfHeight,
              normalizedX,
              normalizedY
            );
            const targetIntersection = getRectIntersection(
              targetX,
              targetY,
              targetHalfWidth,
              targetHalfHeight,
              -normalizedX,
              -normalizedY
            );

            // 両交点の中点を計算（この位置をエッジ上のテキスト表示位置とする）
            const midX = (sourceIntersection.x + targetIntersection.x) / 2;
            const midY = (sourceIntersection.y + targetIntersection.y) / 2;

            return (
              <g key={`selected-${i}`}>
                {/* エッジ表示（グロー効果を追加） */}
                <line
                  x1={sourceX}
                  y1={sourceY}
                  x2={targetX}
                  y2={targetY}
                  filter="url(#glow)"
                  style={{
                    stroke: isHovered ? "orange" : "cyan",
                    strokeWidth:
                      Math.max(linkScale(link.similarity as number), 0.1) + 1,
                  }}
                />

                {/* エッジスコアの表示（ホバー時に drop-shadow を追加） */}
                {link.similarity !== undefined && (
                  <g
                    className="edge-score-container"
                    transform={`translate(${midX}, ${midY})`}
                    onMouseEnter={() =>
                      setTooltip({
                        index: i,
                        x: midX,
                        y: midY,
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
                      className="edge-score select-none"
                      textDecoration="underline"
                      filter="url(#glow)"
                      style={{
                        transition: "filter 0.2s ease, transform 0.2s ease",
                      }}
                    >
                      {link.similarity}%
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>
        {/* styled-jsx を利用してホバー時の drop-shadow 効果を定義 */}
        <style jsx>{`
          .edge-score-container:hover .edge-score {
            filter: url(#glow) drop-shadow(2px 2px 2px rgba(0, 0, 0, 0.7));
            transform: translateY(2px);
          }
        `}</style>
      </>
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

SelectedLinks.displayName = "SelectedLinks";

export default SelectedLinks;
