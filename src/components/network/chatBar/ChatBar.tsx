'use client';

import { useState } from 'react';

type GameResponse = {
  priceRange: string;
  tags: string[];
};

const parseResponse= (response: string): GameResponse => {
  const parts = response.split(" ");

  // 各項目をマップに基づいて変換
  const priceRange = parts[0] === "-1" && parts[1] === "-1" 
    ? "該当なし" 
    : `${parts[0]}円 〜 ${parts[1]}円`;

  // タグ部分をフィルタリングして配列に変換
  const tags = parts.slice(2).filter(tag => tag !== "-1");

  return {
    priceRange,
    tags
  };
};

const ChatBar = () => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState<any>({});

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
        console.log(data.response);
        setResponse(parsedResponse);
      } else {
        console.error("API request failed:", res.statusText);
        setResponse("エラーが発生しました。");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setResponse("エラーが発生しました。");
    }

    setInput('');
  };

  return (
    <div style={{
      display: 'flex', 
      justifyContent: 'center', 
    }}>
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
      {response && (
        <div style={{
          color: 'white', 
          backgroundColor: '#333', 
          borderRadius: '8px',
          maxWidth: '600px'
        }}>
          {response.onlineStatus}
          <br />
          {response.playerMode}
          <br />
          {response.platform}
          <br />
          {response?.tags && response.tags.length !== 0 &&response.tags.map((tag: any) => tag + " ")}
        </div>
      )}
    </div>
  );
};

export default ChatBar;
