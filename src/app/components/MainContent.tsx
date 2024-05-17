// components/MainContent.js
export default function MainContent() {
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">ゲームタイトル</h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <h3 className="text-lg font-semibold mb-2">流行度</h3>
          <div className="bg-gray-200 h-48 mb-4">[流行度グラフ]</div>
          <h3 className="text-lg font-semibold mb-2">関連配信者リスト</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-200 h-24">動画名</div>
            <div className="bg-gray-200 h-24">動画名</div>
            <div className="bg-gray-200 h-24">動画名</div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">一致度</h3>
          <div className="flex flex-col gap-2">
            <input type="range" min="0" max="100" className="w-full" />
            <input type="range" min="0" max="100" className="w-full" />
            <input type="range" min="0" max="100" className="w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
