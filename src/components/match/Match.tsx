import MatchIndicator from "./MatchIndicator";

const Match = () => {
  const gameTitle="Fall guys";
  const appId = "438640";
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">一致度</h3>
      ここはしょうの作成ページです
      <MatchIndicator appId={appId} gameTitle={gameTitle} />
    </div>
  )
}


export default Match
