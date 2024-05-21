import { GAMES } from "@/constants/games";


export default function SimilarGames() {
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-2">類似しているゲーム</h2>
      {GAMES.map((game, index) => (
        <div key={index} className="mb-4">
          <p className="text-center mt-2">{game}</p>
        </div>
      ))}
    </div>
  );
}
