// components/GameSearchButton.tsx
import React from "react";

type Props = {
  onClick: () => void;
};

const GameSearchButton: React.FC<Props> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md shadow-lg z-20"
  >
    ゲームを簡単に探す
  </button>
);

export default GameSearchButton;
