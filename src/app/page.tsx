// pages/index.js
import Head from 'next/head';
import Header from './components/Header';
import SimilarGames from './components/SimilarGames';
import MainContent from './components/MainContent';

export default function Home() {
  return (
    <div>
      <Head>
        <title>Steam Suggester</title>
        <meta name="description" content="Steam game suggestions based on trends" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

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
