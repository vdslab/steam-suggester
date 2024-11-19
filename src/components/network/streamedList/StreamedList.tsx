import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import { NodeType, StreamerListType } from "@/types/NetworkType";
import { useEffect, useState } from "react";
import { ISR_FETCH_INTERVAL } from "@/constants/DetailsConstants";
const similarity : any = require('string-similarity');
import CircularProgress from '@mui/material/CircularProgress';

type Props = {
  nodes: NodeType[];
  streamerIds: StreamerListType[];
  setStreamerIds: React.Dispatch<React.SetStateAction<StreamerListType[]>>;
};

const StreamedList = (props: Props) => {
  const { nodes, streamerIds, setStreamerIds } = props;
  // console.log(nodes)
  const [searchStreamerQuery, setSearchStreamerQuery] = useState<string>('');
  const [filteredStreamerList, setFilteredStreamerList] = useState<StreamerListType[]>([]);
  const [isLoading, setIsLoading] = useState<string[]>([]);

  // string-similariライブラリ(動画タイトル全文とゲームタイトルを比較)
  const isSimilar = (str1: string, str2: string, threshold: number = 0.6) => {
    const similarityScore = similarity.compareTwoStrings(str1, str2);
    return similarityScore >= threshold;
  };
  
  // 単語とゲームタイトルの比較
  const compareTitlesByWords = (title1: string, title2: string, threshold: number = 0.9) => {
    // タイトルを単語に分割(空白で)
    const words1 = title1.split(/\W+/).filter(Boolean);
    const words2 = title2.split(/\W+/).filter(Boolean);

    // 単語ごとに一致をチェック
    for (const word1 of words1) {
      for (const word2 of words2) {
        if (isSimilar(word1.toLowerCase(), word2.toLowerCase(), threshold)) {
          return true;
        }
      }
    }
    return false;
  };

  // ランダムな色を生成する関数（暗すぎる色を除外）
  const getRandomColor = (() => {
    const letters = '0123456789ABCDEF';
    const usedColors: string[] = [];
  
    // 色差を計算する関数 (RGB間のユークリッド距離)
    const getColorDifference = (color1: string, color2: string) => {
      const r1 = parseInt(color1.substring(1, 3), 16);
      const g1 = parseInt(color1.substring(3, 5), 16);
      const b1 = parseInt(color1.substring(5, 7), 16);
  
      const r2 = parseInt(color2.substring(1, 3), 16);
      const g2 = parseInt(color2.substring(3, 5), 16);
      const b2 = parseInt(color2.substring(5, 7), 16);
  
      return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
    };
  
    // 新しい色が既存の色と十分に異なるかを確認
    const isDistinctEnough = (color: string) => {
      const threshold = 100; // 色差の閾値 (調整可能)
      return usedColors.every((usedColor) => getColorDifference(color, usedColor) > threshold);
    };
  
    const generateColor = () => {
      let color = '#';
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    };
  
    const isBrightEnough = (color: string) => {
      const r = parseInt(color.substring(1, 3), 16);
      const g = parseInt(color.substring(3, 5), 16);
      const b = parseInt(color.substring(5, 7), 16);
      const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
      return brightness > 50;
    };
  
    return () => {
      let color;
      do {
        color = generateColor();
      } while (!isBrightEnough(color) || !isDistinctEnough(color));
  
      usedColors.push(color); // 生成した色を記録
      return color;
    };
  })();
  


  const handleSearchClick = async (data: StreamerListType) => {
    setIsLoading((prev) => [...prev, data.id]);
    try {
      // APIを呼び出してstreamerの詳細情報を取得
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_CURRENT_URL}/api/details/getTwitchStreamerStreamedVideoTitle/${data.id}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch streamer data");
      }
      const updatedData: StreamerListType = await response.json();
  
      // 取得したデータを基にstreamedGameListを作成
      const streamedGameList = nodes.reduce((acc: StreamerListType[], node) => {
        updatedData.twitchVideoId.forEach((videoId) => {
          if (compareTitlesByWords(videoId, node.title)) {
            const existingGame = acc.find((g) => g.name === updatedData.name);
            if (existingGame) {
              if (!existingGame.twitchVideoId.includes(node.twitchGameId)) {
                existingGame.twitchVideoId.push(node.twitchGameId);
              }
            } else {
              const newGame = { ...updatedData, twitchVideoId: [node.twitchGameId] };
              acc.push(newGame);
            }
          }
        });
        return acc;
      }, []);
  
      // 新しいゲームが `streamerIds` に存在しない場合に追加
      const newGames = streamedGameList.filter(
        (newGame) => !streamerIds.some((existingGame) => existingGame.name === newGame.name)
      );
  
      if (newGames.length > 0) {
        const randomColor = getRandomColor();
        setStreamerIds((prevStreamerIds) => [
          ...prevStreamerIds,
          { ...newGames[0], color: randomColor }
        ]);
  
        // 検索バーをリセット（stateを更新）
        setSearchStreamerQuery('');
      } else {
        const isAlreadyAdded = streamerIds.some((existingGame) => existingGame.name === updatedData.name);
        if (isAlreadyAdded) {
          alert(`「${updatedData.name}」は既に追加されています。`);
          return;
        } else if (streamedGameList.length === 0) {
          alert(`「${updatedData.name}」のデータが見つかりませんでした。`);
          return;
        } else {
          alert("追加できませんでした。");
        }
      }
    } catch (error) {
      console.error("Error fetching streamer details:", error);
      alert("配信者の情報を取得できませんでした。");
    } finally {
      setIsLoading((prev) => prev.filter((id) => id !== data.id));
    }
  };
  


  const handleGameDelete = (game: StreamerListType) => {
    // 削除するゲームの名前が一致するゲームを削除
    const updatedUserAddedGames = streamerIds.filter((existingGame) => existingGame.name !== game.name);
  
    setStreamerIds(updatedUserAddedGames);
  };
  

  useEffect(() => {
    const fetchData = async () => {
      if (!searchStreamerQuery) return;

      try {
        const encodedQuery = encodeURIComponent(searchStreamerQuery); // 検索クエリをエンコード

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_CURRENT_URL}/api/details/getTwitchStreamerInf/${encodedQuery}`
        );
        const data = await response.json();
        // console.log(data);
        if (Array.isArray(data)) {
          // viewer_count順に並び替え
          const sortedData = data.sort((a: any, b: any) => b.viewer_count - a.viewer_count);
  
          setFilteredStreamerList(sortedData);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchData();
  }, [searchStreamerQuery]);


  return (
    <div className="bg-gray-800 p-2 rounded-lg shadow-lg max-w-xl mx-auto">
      <div className="mb-0">
        <input
          type="text"
          placeholder="ここに配信者を入力"
          value={searchStreamerQuery}
          onChange={(e) => setSearchStreamerQuery(e.target.value)}
          className="w-full px-3 py-1 mb-0 rounded-lg border-2 border-gray-300 focus:outline-none focus:border-blue-500 transition duration-300 ease-in-out"
        />
        {searchStreamerQuery && (
          <div className="bg-gray-700 p-2 rounded-lg mt-0">
            <h2 className="text-gray-400 text-xs font-semibold mb-2">検索結果</h2>
            <div className="max-h-40 overflow-y-auto">
              {filteredStreamerList.map((id) => (
                <div
                  className="flex justify-between items-center bg-gray-600 p-2 mb-1 rounded-lg shadow-md hover:bg-gray-500 transition-all cursor-pointer"
                  key={id.name}
                >
                  <div className="text-white font-medium">{id.name}</div>
                  <div className="flex items-center">
                    {/* 配信中の場合の赤い点（PlaylistAddIconのすぐ左に配置） */}
                    {id.viewer_count !== -1 && (
                      <div
                        className="w-2 h-2 rounded-full bg-red-600 mr-2"
                        style={{ flexShrink: 0 }}
                      ></div>
                    )}
                    <button
                      className="relative"
                      onClick={() => handleSearchClick(id)}
                      disabled={isLoading.includes(id.id)}  // ローディング中はボタンを無効化
                    >
                      {isLoading.includes(id.id) ? (
                        <CircularProgress size={20} color="inherit" className="p-1" />
                      ) : (
                        <PlaylistAddIcon className="cursor-pointer hover:bg-blue-600 p-1 rounded-full transition-all" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>


      <div className="bg-gray-700 p-2 rounded-lg shadow-lg mt-0">
        <h2 className="text-white text-lg font-semibold mb-2">追加済みの配信者</h2>
        {streamerIds.length === 0 ? (
          <p className="text-gray-400">配信者が追加されていません。追加すると配信者が配信したゲームのアイコンに枠が表示されます</p>
        ) : (
          streamerIds.map((id) => (
            <div
              className="flex justify-between items-center bg-gray-600 p-2 mb-1 rounded-lg shadow-md hover:bg-gray-500 transition-all cursor-pointer"
              key={id.twitchVideoId.join(", ")}
            >
              <div
                className="w-10 h-10 rounded-full mr-3 border-4 flex-shrink-0"
                style={{
                  borderColor: id.color,
                  overflow: "hidden",
                }}
              >
                <img
                  src={id.thumbnail}
                  alt={`${id.name} Thumbnail`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-white font-medium flex-grow">{id.name}</div>
              <DeleteIcon
                className="cursor-pointer hover:bg-red-600 p-1 rounded-full transition-all"
                onClick={() => handleGameDelete(id)}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StreamedList;
