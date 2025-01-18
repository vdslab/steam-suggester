import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

type GameTooltipProps = {
  videoUrl: string;
  imgURL: string;
  x: number;
  y: number;
  price: number;
  title: string;
  tags: string[];
  transform: d3.ZoomTransform;
  setHoveredIndex: React.Dispatch<React.SetStateAction<number>>;
  index: number;
};

const GameTooltip: React.FC<GameTooltipProps> = ({
  videoUrl,
  imgURL,
  x,
  y,
  transform,
  setHoveredIndex,
  index,
  price,
  tags,
  title,
}) => {
  const size = 250;
  const halfSize = size / 2;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [useIframe, setUseIframe] = React.useState(false);

  const iframeUrl = `${videoUrl}?controls=0&autoplay=1&mute=1&loop=1`;

  // アニメーションを適用
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.style.transform = "scale(0.8)";
      container.style.opacity = "0";
      requestAnimationFrame(() => {
        container.style.transition = "transform 0.2s ease, opacity 0.2s ease";
        container.style.transform = "scale(1)";
        container.style.opacity = "1";
      });
    }
  }, []);

  return (
    <g
      transform={`translate(${x},${y}) scale(${1 / transform.k})`}
      onMouseEnter={() => setHoveredIndex(index)}
      onMouseLeave={() => setHoveredIndex(-1)}
    >
      <foreignObject
        x={-halfSize}
        y={-halfSize}
        width={size}
        height={size}
        xmlns="http://www.w3.org/1999/xhtml"
        style={{
          pointerEvents: "none",
          zIndex: 10,
        }}
      >
        <div
          ref={containerRef}
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            color: "white",
            fontFamily: "Arial, sans-serif",
            display: "flex",
            flexDirection: "column",
            position: "relative",
            boxSizing: "border-box",
          }}
        >
          {/* 動画セクション */}
          <div
            style={{
              width: "100%",
              height: "50%",
              position: "relative",
            }}
          >
            {!useIframe ? (
              <video
                src={videoUrl}
                autoPlay
                muted
                loop
                playsInline
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
                onError={() => setUseIframe(true)} // エラー時にiframeにフォールバック
              />
            ) : (
              <iframe
                src={iframeUrl}
                title="Game Video"
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                }}
                allow="autoplay"
              ></iframe>
            )}
          </div>

          {/* 画像セクション */}
          <div
            style={{
              position: "relative",
              left: "0",
              width: "60%",
              transform: "translateY(-50%)",
            }}
          >
            <img
              src={imgURL}
              alt="Game Thumbnail"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>

          {/* 金額セクション */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: "50%",
              padding: "0.5em",
              fontSize: "1em",
              fontWeight: "bold",
              textAlign: "right",
              transform: "translateY(0%)",
              boxSizing: "border-box",
            }}
          >
            ￥{price}
          </div>

          {/* タイトルセクション */}
          <div
            style={{
              position: "absolute",
              bottom: "20%",
              width: "100%",
              textAlign: "center",
              fontSize: "1.2em",
              fontWeight: "bold",
              padding: "0.5em",
              boxSizing: "border-box",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {title}
          </div>

          {/* タグリストセクション */}
          <div className="text-white">
            {tags && tags.length > 0 && (
              <div className="line-clamp-2 overflow-hidden">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-green-500 text-xs p-0.5 mr-1 mb-1 rounded inline-block whitespace-nowrap cursor-pointer select-none"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </foreignObject>
    </g>
  );
};

export default GameTooltip;
