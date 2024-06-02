import { TwitchClips } from "@/types/distributorVideos/TwitchClips";
import Image from "next/image";

export const DisplayClip = (props: TwitchClips) => {
  const { url, image, title, viewCount } = props;

  console.log(image)

  return (
    <div className="flex flex-col">
      <Image src={image} alt="clip1" width={100} height={200} /> 
      <div className="text-white">{title}</div>
    </div>
  );
};
