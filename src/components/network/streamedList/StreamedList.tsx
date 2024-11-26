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

  return (
   <div></div>
  );
};

export default StreamedList;
