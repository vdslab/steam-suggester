import React from "react";
import { LinkType } from "@/types/NetworkType";
import * as d3 from "d3";

type NonSelectedLinksProps = {
  nonSelectedLinks: LinkType[];
  hoveredIndex: number;
  selectedIndex: number;
  linkScale: d3.ScaleLinear<number, number>;
};

const NonSelectedLinks: React.FC<NonSelectedLinksProps> = React.memo(
  ({ nonSelectedLinks, hoveredIndex, selectedIndex, linkScale }) => {
    return (
      <>
        {nonSelectedLinks.map((link: LinkType, i: number) => {
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
      </>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.nonSelectedLinks === nextProps.nonSelectedLinks &&
      prevProps.hoveredIndex === nextProps.hoveredIndex &&
      prevProps.selectedIndex === nextProps.selectedIndex &&
      prevProps.linkScale === nextProps.linkScale
    );
  }
);

export default NonSelectedLinks;
