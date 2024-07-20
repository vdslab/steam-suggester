import { TwitchClipType } from "@/types/api/DetailsTypes"
import Headline from "../common/Headline"
import DisplayClip from "./DisplayClip"

const DistributorVideos = async({twitchGameId}:{twitchGameId:string}) => {


  const res = await fetch(
    `${process.env.NEXT_PUBLIC_CURRENT_URL}/api/details/getTwitchClips/${twitchGameId}`
  , { next: { revalidate: 86400 }})
  const data:TwitchClipType[] = await res.json()


  return (
    <div>
      <Headline txt='関連配信者リスト' />
      <div className="flex flex-row space-x-5">
        {data.map((clip: TwitchClipType) => (
          <DisplayClip
            key={clip.id}
            id={clip.id}
            url={clip.url}
            embedUrl={clip.embedUrl}
            image={clip.image}
            title={clip.title}/>
        ))}
      </div>
    </div>
  )
}

export default DistributorVideos