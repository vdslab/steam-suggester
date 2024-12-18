// components/GameList/SearchBar.tsx
"use client";

type Props = {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
};

const SearchBar = (props:Props) => {

  const { searchQuery, setSearchQuery } = props;

  return (
    <input
      type="text"
      placeholder="ゲームタイトルを検索"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="w-full p-2 mb-2 text-black rounded border-2 border-gray-300 focus:outline-none focus:border-blue-500 transition duration-300 ease-in-out"
    />
  );
};

export default SearchBar;