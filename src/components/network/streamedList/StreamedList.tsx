import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import YouTubeIcon from '@mui/icons-material/YouTube';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import { NodeType, StreamerListType } from "@/types/NetworkType";
import { useCallback, useEffect, useState } from "react";
import { stringSimilarity } from "string-similarity-js";
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Image from 'next/image';

type Props = {
  nodes: NodeType[];
  streamerIds: StreamerListType[];
  setStreamerIds: React.Dispatch<React.SetStateAction<StreamerListType[]>>;
};

const StreamedList = (props: Props) => {
  const { nodes, streamerIds, setStreamerIds } = props;
  console.log(streamerIds);
  const [searchStreamerQuery, setSearchStreamerQuery] = useState<string>('');
  const [filteredStreamerList, setFilteredStreamerList] = useState<StreamerListType[]>([]);
  const [isLoading, setIsLoading] = useState<string[]>([]);
  const [showLimitAlert, setShowLimitAlert] = useState<boolean>(false); // 配信者追加制限アラート
  const [showDataNotFoundAlert, setShowDataNotFoundAlert] = useState<boolean>(false); // データ未発見アラート
  const [showDuplicateAlert, setShowDuplicateAlert] = useState<boolean>(false); // 重複追加アラート

  const MAX_STREAMERS = 10; // 最大配信者数

  // string-similarityライブラリ(動画タイトル全文とゲームタイトルを比較)
  const isSimilar = (str1: string, str2: string, threshold: number = 0.6) => {
    const similarityScore = stringSimilarity(str1, str2);
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

  // 事前定義された色のパレットを使用
  const colorPalette = [
    '#FF5733', // 赤
    '#33FF57', // 緑
    '#3357FF', // 青
    '#FF33A8', // ピンク
    '#FF8F33', // オレンジ
    '#8F33FF', // 紫
    '#33FFF5', // 水色
    '#F533FF', // マゼンタ
    '#F5FF33', // 黄
    '#33FF8F', // ライムグリーン
  ];

  const getRandomColor = (() => {
    const usedColors: string[] = [];

    return () => {
      const availableColors = colorPalette.filter(color => !usedColors.includes(color));
      if (availableColors.length === 0) {
        console.warn("No more unique colors available in the palette.");
        return '#FFFFFF'; // 代替色
      }
      const color = availableColors[Math.floor(Math.random() * availableColors.length)];
      usedColors.push(color);
      return color;
    };
  })();

  const handleSearchClick = async (data: StreamerListType) => {
    // 追加: 10件に達している場合は追加を防止
    if (streamerIds.length >= MAX_STREAMERS) {
      setShowLimitAlert(true);
      return;
    }

    setIsLoading((prev) => [...prev, data.id]);
    try {
      let updatedData: StreamerListType;

      if (data.platform === 'twitch') {
        // Twitchの詳細情報を取得
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_CURRENT_URL}/api/details/getTwitchStreamerStreamedVideoTitle/${data.id}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch Twitch streamer data");
        }
        updatedData = await response.json();
      } else if (data.platform === 'youtube') {
        // YouTubeの詳細情報を取得
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_CURRENT_URL}/api/details/getYoutuberVideoTitle/${data.id}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch YouTube streamer data");
        }
        updatedData = await response.json();
      } else {
        throw new Error("Unknown platform");
      }

      // 取得したデータを基にstreamedGameListを作成
      const streamedGameList = nodes.reduce((acc: StreamerListType[], node) => {
        const relevantStreamIds = updatedData.streamId; // gameName を含む
        const relevantVideoIds = updatedData.videoId; // video titles

        // ゲーム名でフィルタリング
        relevantStreamIds.forEach((gameName) => {
          if (gameName === node.gameName) { // gameName と一致
            const existingGame = acc.find((g) => g.name === updatedData.name && g.platform === updatedData.platform);
            if (existingGame) {
              if (!existingGame.streamId.includes(gameName)) {
                existingGame.streamId.push(gameName);
              }
            } else {
              const newGame: StreamerListType = {
                ...updatedData,
                streamId: [gameName],
                videoId: updatedData.videoId,
              };
              acc.push(newGame);
            }
          }
        });

        // 過去のビデオタイトルとの関連性でフィルタリング
        relevantVideoIds.forEach((videoTitle) => {
          if (compareTitlesByWords(videoTitle, node.title)) {
            const existingGame = acc.find((g) => g.name === updatedData.name && g.platform === updatedData.platform);
            if (existingGame) {
              if (!existingGame.videoId.includes(node.twitchGameId)) {
                existingGame.videoId.push(node.twitchGameId);
              }
            } else {
              const newGame: StreamerListType = {
                ...updatedData,
                streamId: updatedData.streamId,
                videoId: [node.twitchGameId],
              };
              acc.push(newGame);
            }
          }
        });

        return acc;
      }, []);

      // 新しいゲームが `streamerIds` に存在しない場合に追加
      const newGames = streamedGameList.filter(
        (newGame) => !streamerIds.some((existingGame) => existingGame.name === newGame.name && existingGame.platform === newGame.platform)
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
        const isAlreadyAdded = streamerIds.some((existingGame) => existingGame.name === updatedData.name && existingGame.platform === updatedData.platform);
        if (isAlreadyAdded) {
          setShowDuplicateAlert(true); // 重複アラートを表示
          return;
        } else if (streamedGameList.length === 0) {
          setShowDataNotFoundAlert(true); // データ未発見アラートを表示
          return;
        } else {
          setShowDataNotFoundAlert(true); // その他のエラーもデータ未発見として扱う
          return;
        }
      }
    } catch (error) {
      console.error("Error fetching streamer details:", error);
      setShowDataNotFoundAlert(true); // エラー時にもデータ未発見アラートを表示
    } finally {
      setIsLoading((prev) => prev.filter((id) => id !== data.id));
    }
  };

  const handleGameDelete = (game: StreamerListType) => {
    // 削除するゲームの名前とプラットフォームが一致するゲームを削除
    const updatedUserAddedGames = streamerIds.filter(
      (existingGame) => !(existingGame.name === game.name && existingGame.platform === game.platform)
    );

    setStreamerIds(updatedUserAddedGames);
  };

  // Custom debounce implementation using useEffect and setTimeout
  useEffect(() => {
    // If the search query is empty, clear the filtered list and return
    if (!searchStreamerQuery) {
      setFilteredStreamerList([]);
      return;
    }

    // Set a timeout to perform the search after 1 second of inactivity
    const handler = setTimeout(async () => {
      try {
        // Twitch API
        const twitchResponse = await fetch(
          `${process.env.NEXT_PUBLIC_CURRENT_URL}/api/details/getTwitchStreamerInf/${encodeURIComponent(searchStreamerQuery)}`
        );
        let twitchData: StreamerListType[] = [];
        if (twitchResponse.ok) {
          twitchData = await twitchResponse.json();
          // 各Twitchストリーマーにプラットフォーム情報を追加
          twitchData = twitchData.map((streamer) => ({
            ...streamer,
            platform: 'twitch',
          }));
        }

        // YouTube API
        const youtubeResponse = await fetch(
          `${process.env.NEXT_PUBLIC_CURRENT_URL}/api/details/getYoutuberInf/${encodeURIComponent(searchStreamerQuery)}`
        );
        let youtubeData: StreamerListType[] = [];
        if (youtubeResponse.ok) {
          youtubeData = await youtubeResponse.json();
          // 各YouTubeストリーマーにプラットフォーム情報を追加
          youtubeData = youtubeData.map((streamer) => ({
            ...streamer,
            platform: 'youtube',
          }));
        }

        // TwitchとYouTubeのデータを統合
        const combinedData = [...twitchData, ...youtubeData];

        // viewer_count順に並び替え（数字のみ比較）
        const sortedData = combinedData.sort((a, b) => {
          const viewerA = typeof a.viewer_count === 'number' ? a.viewer_count : parseInt(a.viewer_count) || 0;
          const viewerB = typeof b.viewer_count === 'number' ? b.viewer_count : parseInt(b.viewer_count) || 0;
          return viewerB - viewerA;
        });

        setFilteredStreamerList(sortedData);
      } catch (error) {
        console.error('Error:', error);
      }
    }, 1000); // 1秒の遅延

    return () => {
      clearTimeout(handler);
    };
  }, [searchStreamerQuery, nodes]);

  return (
   <div></div>
  );
};

export default StreamedList;
