'use client';

import { useState } from 'react';

type GameResponse = {
  onlineStatus: string;
  playerMode: string;
  platform: string;
  popularity: string;
  priceRange: string;
  tags: string[];
};

function parseResponse(response: string): GameResponse {
  const parts = response.split(" ");
  
  const onlineStatusMap: { [key: string]: string } = {
    "1": "オンライン",
    "2": "オフライン",
    "3": "両方対応"
  };

  const playerModeMap: { [key: string]: string } = {
    "1": "シングルプレイヤー",
    "2": "マルチプレイヤー",
    "3": "両方対応"
  };

  const platformMap: { [key: string]: string } = {
    "1": "Windows",
    "2": "Mac",
    "3": "両方対応"
  };

  const popularityMap: { [key: string]: string } = {
    "-1": "該当なし",
    "1": "低い",
    "2": "やや低い",
    "3": "普通",
    "4": "高い",
    "5": "非常に高い"
  };

  // 各項目をマップに基づいて変換
  const onlineStatus = onlineStatusMap[parts[0] as keyof typeof onlineStatusMap] || "不明";
  const playerMode = playerModeMap[parts[1] as keyof typeof playerModeMap] || "不明";
  const platform = platformMap[parts[2] as keyof typeof platformMap] || "不明";
  const popularity = popularityMap[parts[3] as keyof typeof popularityMap] || "該当なし";
  const priceRange = parts[4] === "-1" && parts[5] === "-1" 
    ? "該当なし" 
    : `${parts[4]}円 〜 ${parts[5]}円`;

  // タグ部分をフィルタリングして配列に変換
  const tags = parts.slice(6).filter(tag => tag !== "-1");

  return {
    onlineStatus,
    playerMode,
    platform,
    popularity,
    priceRange,
    tags
  };
}

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

    setInput(''); // フォーム入力をリセット
  };

  return (
    <div style={{
      display: 'flex', 
      justifyContent: 'center', 
      backgroundColor: '#121212'
    }}>
      <form 
        onSubmit={handleSubmit} 
        style={{
          display: 'flex', 
          width: '80%', 
          maxWidth: '600px', 
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.5)', 
          padding: '10px', 
          borderRadius: '24px',
          backgroundColor: '#1E1E1E'
        }}
      >
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Type your message..."
          style={{
            flexGrow: 1, 
            padding: '12px', 
            fontSize: '16px', 
            border: 'none', 
            outline: 'none', 
            borderRadius: '16px',
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
            borderRadius: '16px',
            marginLeft: '8px'
          }}
        >
          Send
        </button>
      </form>
      {response && (
        <div style={{
          marginTop: '16px', 
          color: 'white', 
          backgroundColor: '#333', 
          padding: '10px', 
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
