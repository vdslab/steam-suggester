/* ChatBar.tsx */
"use client";

import { NodeType } from '@/types/NetworkType';
import { useState } from 'react';

type Props = {
  nodes: NodeType[];
  setNodes: React.Dispatch<React.SetStateAction<NodeType[]>>;
};

const ChatBar = (props: Props) => {
  const { nodes, setNodes } = props;
  const [input, setInput] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // ... existing logic ...
    setInput('');
  };

  return (
    <div className="bg-gray-800 px-2 pb-2 rounded shadow-lg">
      <p className="text-gray-400 mb-2">ゲームに関する質問を入力してください。ネットワーク内の関連ノードが強調表示されます。</p>
      <form onSubmit={handleSubmit} className="flex">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="例：おすすめのマルチプレイヤーゲームは？"
          className="flex-grow p-2 rounded-l bg-gray-700 text-white"
        />
        <button
          type="submit"
          disabled={!input}
          className={`p-2 rounded-r ${input ? 'bg-blue-600 hover:bg-blue-500' : 'bg-gray-600 cursor-not-allowed'}`}
        >
          送信
        </button>
      </form>
    </div>
  );
};

export default ChatBar;
