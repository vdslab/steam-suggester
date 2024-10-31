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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <form 
        onSubmit={handleSubmit} 
        style={{
          display: 'flex', 
          width: '80%', 
          maxWidth: '600px', 
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.5)', 
          padding: '10px', 
          borderRadius: '30px',
          backgroundColor: '#1E1E1E'
        }}
      >
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="メッセージを送信"
          style={{
            flexGrow: 1, 
            padding: '12px', 
            fontSize: '16px', 
            border: 'none', 
            outline: 'none', 
            borderRadius: '30px',
            color: 'white',
            backgroundColor: '#2C2C2C'
          }}
        />
        <button 
          type="submit" 
          style={{
            padding: '10px 15px', 
            fontSize: '16px', 
            border: 'none', 
            backgroundColor: `${input ? 'white' : 'gray'}`, 
            color: 'black', 
            borderRadius: '30px',
            marginLeft: '8px'
          }}
        >
          ↑
        </button>
      </form>
    </div>
  );
};

export default ChatBar;
