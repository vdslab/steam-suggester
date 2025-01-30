'use client'
import { TwitchClipType } from "@/types/api/getTwitchClipType";
import useSWR from "swr";
import { fetcher } from "../../common/Fetcher";
import { CircularProgress } from "@mui/material";
import SlideshowOutlinedIcon from '@mui/icons-material/SlideshowOutlined';
import Section from "../../sidebar/Section";
import ClipSlideshow from "./ClipSlideshow";


type Props = {
  twitchGameId: string;
};

const DistributorVideos = (props: Props) => {

  const { twitchGameId } = props;

  const { data, error } = useSWR<TwitchClipType[]>(`${process.env.NEXT_PUBLIC_CURRENT_URL}/api/details/getTwitchClips/${twitchGameId}`,
    fetcher,
  );

  if (error) return <div style={{ textAlign: 'center' }}>データの取得中にエラーが発生しました。</div>;

  if (!data) return <div style={{ textAlign: 'center' }}><CircularProgress /></div>;

  return (
    <div className="mt-4">
      <Section icon={<SlideshowOutlinedIcon />} title="Twitchクリップ">
        <ClipSlideshow data={data} />
      </Section>
    </div>
  );
};

export default DistributorVideos;
