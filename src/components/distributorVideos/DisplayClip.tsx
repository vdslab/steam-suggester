import { TwitchClips } from "@/types/distributorVideos/TwitchClips";

const DisplayClip = (props: TwitchClips) => {

  const { url, embedUrl, image, title } = props;

  return (
    <div className="flex flex-col ">
      <div className="w-60 h-44">
        <iframe
          src={`${embedUrl}&parent=localhost`}
          width='400'
          height='300'
          allowFullScreen
          className="scale-50 origin-top-left"
        />
      </div>
      <a
        className="text-white"
        href={url} target="_blank"
        rel="noopener noreferrer"
      >
        {title}
      </a>
    </div>
  );
};

export default DisplayClip;
