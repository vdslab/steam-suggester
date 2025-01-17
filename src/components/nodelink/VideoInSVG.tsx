import React from "react";

type VideoInSVGProps = {
  webmUrl: string;
  mp4Url: string;
  x: number;
  y: number;
  width: number;
  aspectRatio?: number; // オプションでアスペクト比を指定可能（デフォルトは16:9）
};

const VideoInSVG: React.FC<VideoInSVGProps> = ({
  webmUrl,
  mp4Url,
  x,
  y,
  width,
  aspectRatio = 16 / 9, // デフォルトのアスペクト比
}) => {
  const height = width / aspectRatio;

  return (
    <foreignObject x={x} y={y} width={width} height={height}>
      <video
        width="100%"
        height="100%"
        autoPlay
        loop
        muted
        playsInline
        style={{
          borderRadius: "10px",
          objectFit: "cover",
        }}
      >
        <source src={webmUrl} type="video/webm" />
        <source src={mp4Url} type="video/mp4" />
        お使いのブラウザは動画タグをサポートしていません。
      </video>
    </foreignObject>
  );
};

export default VideoInSVG;
