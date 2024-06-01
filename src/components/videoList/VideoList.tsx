import Headline from "../common/Headline"

const VideoList = () => {
  return (
    <div>
      <Headline txt="関連配信者リスト" />
      <div className="flex flex-row space-x-5">
        <div className="bg-gray-200 h-24 basis-1/4">動画名</div>
        <div className="bg-gray-200 h-24 basis-1/4">動画名</div>
        <div className="bg-gray-200 h-24 basis-1/4">動画名</div>
      </div>
    </div>
  )
}

export default VideoList
