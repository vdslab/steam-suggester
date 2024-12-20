import ClipSlideshow from "./ClipSlideshow";
import { DetailsPropsType } from "@/types/DetailsType";
import CircularProgress from "@mui/material/CircularProgress";

const DistributorVideos = async({ twitchGameId }: DetailsPropsType) => {

  const data = await fetch(`${process.env.NEXT_PUBLIC_CURRENT_URL}/api/details/getTwitchClips/${twitchGameId}`);
  const twitchClipData = await data.json();

  if (!twitchClipData) {
    return (
      <div className="flex justify-center items-center h-40">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="bg-gray-700 rounded-lg shadow-lg">
      {twitchClipData.length === 0 ? (
        <div className="text-white text-center">
          直近の配信者のクリップがありません
        </div>
      ) : (
        <div className="relative">
          <ClipSlideshow data={twitchClipData} />
        </div>
      )}
    </div>
  );
};

export default DistributorVideos;
