'use client'
import useTwitchClips from "@/hooks/distributorVideos/useTwitchClips"
import Headline from "../common/Headline"
import { DisplayClip } from "./DisplayClip"

export const DistributorVideos = () => {

  const { data, error, isLoading} = useTwitchClips()

  if (isLoading) return <div>loading...</div>


  return (
    <div>
      {/* <Headline txt='関連配信者リスト' />
      <div className="flex flex-row space-x-5">
        {data.map((clip: any) => (
          <DisplayClip
            key={clip.id}
            id={clip.id}
            url={clip.url}
            embedUrl={clip.embedUrl}
            image={clip.image}
            title={clip.title}/>
        ))}
      </div> */}
    </div>
  )
}
