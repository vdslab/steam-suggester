// components/SimilarGames.js
import Image from 'next/image';

const games = [
  { src: '/dota2.jpg', alt: 'Dota 2' },
  { src: '/dota2.jpg', alt: 'Apex Legends' },
  { src: '/dota2.jpg', alt: 'League of Legends' },
  { src: '/dota2.jpg', alt: 'Valorant' },
  { src: '/dota2.jpg', alt: 'Valorant' },
];

export default function SimilarGames() {
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-2">類似しているゲーム</h2>
      {games.map((game, index) => (
        <div key={index} className="mb-4">
          <Image src={game.src} alt={game.alt} width={300} height={150} className="rounded" />
          <p className="text-center mt-2">{game.alt}</p>
        </div>
      ))}
    </div>
  );
}
