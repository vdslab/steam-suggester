"use client";

import ClipSlideshow from "../../distributorVideos/ClipSlideshow";
import CircularProgress from "@mui/material/CircularProgress";
import useSWR from "swr";

type Props = {
  nodes: any[];
  selectedIndex: number;
};

const DistributorVideos: React.FC<Props> = ({ nodes, selectedIndex }) => {
  const selectedNode = nodes[selectedIndex] || null;

  const { data, error } = useSWR(
    selectedNode
      ? `${process.env.NEXT_PUBLIC_CURRENT_URL}/api/details/getTwitchClips/${selectedNode.twitchGameId}`
      : null
  );

  if (!selectedNode) {
    return (
      <></>
      //   <div className="text-white text-center">ゲームが選択されていません。</div>
    );
  }

  if (!data) {
    return (
      <div className="flex justify-center items-center h-40">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center">
        データの取得中にエラーが発生しました。
      </div>
    );
  }

  return (
    <div className="bg-gray-700 rounded-lg shadow-lg">
      {data.length === 0 ? (
        <div className="text-white text-center">
          直近の配信者のクリップがありません
        </div>
      ) : (
        <div className="relative">
          <ClipSlideshow data={data} />
        </div>
      )}
    </div>
  );
};

export default DistributorVideos;
