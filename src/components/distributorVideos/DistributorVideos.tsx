import { TwitchClipType } from "@/types/api/getTwitchClipType";
import Headline from "../common/Headline";
import ClipSlideshow from "./ClipSlideshow";
import { DetailsPropsType } from "@/types/DetailsType";
import { ISR_FETCH_INTERVAL } from "@/constants/DetailsConstants";

const DistributorVideos = async (props: DetailsPropsType) => {

  const { twitchGameId } = props;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_CURRENT_URL}/api/details/getTwitchClips/${twitchGameId}`,
    { next: { revalidate: ISR_FETCH_INTERVAL } }
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
