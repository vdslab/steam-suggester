import { useState, useEffect, useCallback } from "react";
import { TwitchClipType } from "@/types/api/DetailsTypes";
import Headline from "../common/Headline";
import ClipSlideshow from "./ClipSlideshow";

type Props = {
  twitchGameId: string;
};

const DistributorVideos = async (props: Props) => {

  const { twitchGameId } = props;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_CURRENT_URL}/api/details/getTwitchClips/${twitchGameId}`,
    { next: { revalidate: 86400 } }
  );
  const data: TwitchClipType[] = await res.json();

  return (
    <div>
      <Headline txt='配信者クリップ' />
      {data.length === 0 ? (<div className="text-white">直近の配信者のクリップがありません</div>) :
        <div className="relative flex items-center justify-center">
          <ClipSlideshow data={data} />
        </div>}
    </div>
  );
};

export default DistributorVideos;
