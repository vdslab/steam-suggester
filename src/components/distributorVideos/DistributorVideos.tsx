'use client'

import ClipSlideshow from "./ClipSlideshow";
import { DetailsPropsType } from "@/types/DetailsType";
import CircularProgress from "@mui/material/CircularProgress";
import useSWR from "swr";
import { fetcher } from "../common/Fetcher";

const DistributorVideos = ({ twitchGameId }: DetailsPropsType) => {

  const { data, error } = useSWR(`${process.env.NEXT_PUBLIC_CURRENT_URL}/api/details/getTwitchClips/${twitchGameId}`, fetcher);

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
