import SimilarGames from './components/SimilarGames';
import MainContent from './components/MainContent';

export default function Home() {
  return (
    <div>
      <main className="flex">
        <aside className="w-1/4 bg-gray-100">
          <SimilarGames />
        </aside>
        <section className="w-3/4 bg-white">
          <MainContent />
        </section>
      </main>
    </div>
  );
}
