'use client';

import { NodeType } from '@/types/NetworkType';
import { useState, useEffect } from 'react';

type Props = {
  nodes: NodeType[];
  setNodes: React.Dispatch<React.SetStateAction<NodeType[]>>;
};

type GameResponse = {
  priceRange: string[];
  tags: string[];
};

const parseResponse = (response: string): GameResponse => {
  const parts = response.split(" ");
  const priceRange = [parts[0], parts[1]];
  const tags = parts.slice(2).filter(tag => tag !== "0");
  return { priceRange, tags };
};

const ChatBar = (props: Props) => {
  const { nodes, setNodes } = props;
  const [input, setInput] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/network/openaiHandler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userQuestion: input }),
      });
      if (res.ok) {
        const data = await res.json();
        const parsedResponse = parseResponse(data.response);
        const buffNodes = [...nodes];
        const suggestValueList = buffNodes.map((node: NodeType) => {
          const minPrice = parseInt(parsedResponse.priceRange[0]);
          const maxPrice = parseInt(parsedResponse.priceRange[1]);
          if ((minPrice !== -1 && minPrice > node.price) || (maxPrice !== -1 && maxPrice < node.price)) return 0;
          return parsedResponse.tags.filter(resTag => node.tags.includes(resTag)).length;
        });

        const maxValue = Math.max(...suggestValueList);
        const scaleSuggestValueList = suggestValueList.map((value: number) => value / maxValue);

        setNodes((prevNodes) => prevNodes.map((node: NodeType, index: number) => {
          return { ...node, suggestValue: scaleSuggestValueList[index] };
        }));
      } else {
        console.error("API request failed:", res.statusText);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
    setInput('');
  };

  return (
    <div className="bg-gray-800 p-4 rounded shadow-lg">
      <p className="text-white mb-2">ゲームに関する質問を入力してください。ネットワーク内の関連ノードが強調表示されます。</p>
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
