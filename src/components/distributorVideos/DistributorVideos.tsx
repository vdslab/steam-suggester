'use client';
import { TwitchClipType } from "@/types/api/getTwitchClipType";
import Headline from "../common/Headline";
import ClipSlideshow from "./ClipSlideshow";
import { DetailsPropsType } from "@/types/DetailsType";
import { ISR_FETCH_INTERVAL } from "@/constants/DetailsConstants";
import { useState, useEffect } from 'react';

const DistributorVideos = ({ twitchGameId }: DetailsPropsType) => {
  const [clips, setClips] = useState<TwitchClipType[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClips = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_CURRENT_URL}/api/details/getTwitchClips/${twitchGameId}`,
          { next: { revalidate: ISR_FETCH_INTERVAL } }
        );
        if (!res.ok) throw new Error('配信者クリップの取得に失敗しました');
        const data: TwitchClipType[] = await res.json();
        setClips(data);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchClips();
  }, [twitchGameId]);

  return (
    <div className="bg-gray-700 rounded-lg shadow-lg">
      {error ? (
        <div className="text-red-500 text-center">
          {error}
        </div>
      ) : clips.length === 0 ? (
        <div className="text-white text-center">
          直近の配信者のクリップがありません
        </div>
      ) : (
        <div className="relative">
          <ClipSlideshow data={clips} />
        </div>
      )}
    </div>
  );
};

export default DistributorVideos;
