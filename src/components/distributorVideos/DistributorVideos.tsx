import Headline from "../common/Headline"
import DisplayClip from "./DisplayClip"

const DistributorVideos = async() => {


  const res = await fetch(`${process.env.NEXT_PUBLIC_CURRENT_URL}/api/distributorVideos/getTwitchClips`)
  const data = await res.json()


  return (
    <div>
      <Headline txt='関連配信者リスト' />
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
      </div>
    </div>
  )
}

export default DistributorVideos