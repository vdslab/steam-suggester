import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import YouTubeIcon from '@mui/icons-material/YouTube';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import { NodeType, StreamerListType } from "@/types/NetworkType";
import { useCallback, useEffect, useState } from "react";
// import similarity from 'string-similarity';
import CircularProgress from '@mui/material/CircularProgress';
// import debounce from 'lodash.debounce';
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
  return(
    <>a</>
  )
//   const [searchStreamerQuery, setSearchStreamerQuery] = useState<string>('');
//   const [filteredStreamerList, setFilteredStreamerList] = useState<StreamerListType[]>([]);
//   const [isLoading, setIsLoading] = useState<string[]>([]);
//   const [showLimitAlert, setShowLimitAlert] = useState<boolean>(false); // 配信者追加制限アラート
//   const [showDataNotFoundAlert, setShowDataNotFoundAlert] = useState<boolean>(false); // データ未発見アラート
//   const [showDuplicateAlert, setShowDuplicateAlert] = useState<boolean>(false); // 重複追加アラート

//   const MAX_STREAMERS = 10; // 最大配信者数

//   // string-similarityライブラリ(動画タイトル全文とゲームタイトルを比較)
//   const isSimilar = (str1: string, str2: string, threshold: number = 0.6) => {
//     const similarityScore = similarity.compareTwoStrings(str1, str2);
//     return similarityScore >= threshold;
//   };

//   // 単語とゲームタイトルの比較
//   const compareTitlesByWords = (title1: string, title2: string, threshold: number = 0.9) => {
//     // タイトルを単語に分割(空白で)
//     const words1 = title1.split(/\W+/).filter(Boolean);
//     const words2 = title2.split(/\W+/).filter(Boolean);

//     // 単語ごとに一致をチェック
//     for (const word1 of words1) {
//       for (const word2 of words2) {
//         if (isSimilar(word1.toLowerCase(), word2.toLowerCase(), threshold)) {
//           return true;
//         }
//       }
//     }
//     return false;
//   };

//   // 事前定義された色のパレットを使用
//   const colorPalette = [
//     '#FF5733', // 赤
//     '#33FF57', // 緑
//     '#3357FF', // 青
//     '#FF33A8', // ピンク
//     '#FF8F33', // オレンジ
//     '#8F33FF', // 紫
//     '#33FFF5', // 水色
//     '#F533FF', // マゼンタ
//     '#F5FF33', // 黄
//     '#33FF8F', // ライムグリーン
//   ];

//   const getRandomColor = (() => {
//     const usedColors: string[] = [];

//     return () => {
//       const availableColors = colorPalette.filter(color => !usedColors.includes(color));
//       if (availableColors.length === 0) {
//         console.warn("No more unique colors available in the palette.");
//         return '#FFFFFF'; // 代替色
//       }
//       const color = availableColors[Math.floor(Math.random() * availableColors.length)];
//       usedColors.push(color);
//       return color;
//     };
//   })();

//   const handleSearchClick = async (data: StreamerListType) => {
//     // 追加: 10件に達している場合は追加を防止
//     if (streamerIds.length >= MAX_STREAMERS) {
//       setShowLimitAlert(true);
//       return;
//     }

//     setIsLoading((prev) => [...prev, data.id]);
//     try {
//       let updatedData: StreamerListType;

//       if (data.platform === 'twitch') {
//         // Twitchの詳細情報を取得
//         const response = await fetch(
//           `${process.env.NEXT_PUBLIC_CURRENT_URL}/api/details/getTwitchStreamerStreamedVideoTitle/${data.id}`
//         );
//         if (!response.ok) {
//           throw new Error("Failed to fetch Twitch streamer data");
//         }
//         updatedData = await response.json();
//       } else if (data.platform === 'youtube') {
//         // YouTubeの詳細情報を取得
//         const response = await fetch(
//           `${process.env.NEXT_PUBLIC_CURRENT_URL}/api/details/getYoutuberVideoTitle/${data.id}`
//         );
//         if (!response.ok) {
//           throw new Error("Failed to fetch YouTube streamer data");
//         }
//         updatedData = await response.json();
//       } else {
//         throw new Error("Unknown platform");
//       }

//       // 取得したデータを基にstreamedGameListを作成
//       const streamedGameList = nodes.reduce((acc: StreamerListType[], node) => {
//         const relevantStreamIds = updatedData.streamId; // gameName を含む
//         const relevantVideoIds = updatedData.videoId; // video titles

//         // ゲーム名でフィルタリング
//         relevantStreamIds.forEach((gameName) => {
//           if (gameName === node.gameName) { // gameName と一致
//             const existingGame = acc.find((g) => g.name === updatedData.name && g.platform === updatedData.platform);
//             if (existingGame) {
//               if (!existingGame.streamId.includes(gameName)) {
//                 existingGame.streamId.push(gameName);
//               }
//             } else {
//               const newGame: StreamerListType = {
//                 ...updatedData,
//                 streamId: [gameName],
//                 videoId: updatedData.videoId,
//               };
//               acc.push(newGame);
//             }
//           }
//         });

//         // 過去のビデオタイトルとの関連性でフィルタリング
//         relevantVideoIds.forEach((videoTitle) => {
//           if (compareTitlesByWords(videoTitle, node.title)) {
//             const existingGame = acc.find((g) => g.name === updatedData.name && g.platform === updatedData.platform);
//             if (existingGame) {
//               if (!existingGame.videoId.includes(node.twitchGameId)) {
//                 existingGame.videoId.push(node.twitchGameId);
//               }
//             } else {
//               const newGame: StreamerListType = {
//                 ...updatedData,
//                 streamId: updatedData.streamId,
//                 videoId: [node.twitchGameId],
//               };
//               acc.push(newGame);
//             }
//           }
//         });

//         return acc;
//       }, []);

//       // 新しいゲームが `streamerIds` に存在しない場合に追加
//       const newGames = streamedGameList.filter(
//         (newGame) => !streamerIds.some((existingGame) => existingGame.name === newGame.name && existingGame.platform === newGame.platform)
//       );

//       if (newGames.length > 0) {
//         const randomColor = getRandomColor();
//         setStreamerIds((prevStreamerIds) => [
//           ...prevStreamerIds,
//           { ...newGames[0], color: randomColor }
//         ]);

//         // 検索バーをリセット（stateを更新）
//         setSearchStreamerQuery('');
//       } else {
//         const isAlreadyAdded = streamerIds.some((existingGame) => existingGame.name === updatedData.name && existingGame.platform === updatedData.platform);
//         if (isAlreadyAdded) {
//           setShowDuplicateAlert(true); // 重複アラートを表示
//           return;
//         } else if (streamedGameList.length === 0) {
//           setShowDataNotFoundAlert(true); // データ未発見アラートを表示
//           return;
//         } else {
//           setShowDataNotFoundAlert(true); // その他のエラーもデータ未発見として扱う
//           return;
//         }
//       }
//     } catch (error) {
//       console.error("Error fetching streamer details:", error);
//       setShowDataNotFoundAlert(true); // エラー時にもデータ未発見アラートを表示
//     } finally {
//       setIsLoading((prev) => prev.filter((id) => id !== data.id));
//     }
//   };

//   const handleGameDelete = (game: StreamerListType) => {
//     // 削除するゲームの名前とプラットフォームが一致するゲームを削除
//     const updatedUserAddedGames = streamerIds.filter(
//       (existingGame) => !(existingGame.name === game.name && existingGame.platform === game.platform)
//     );

//     setStreamerIds(updatedUserAddedGames);
//   };

//   // デバウンスされた検索関数
//   const debouncedFetch = useCallback(
//     debounce(async (query: string) => {
//       if (!query) {
//         setFilteredStreamerList([]);
//         return;
//       }

//       try {
//         // Twitch API
//         const twitchResponse = await fetch(
//           `${process.env.NEXT_PUBLIC_CURRENT_URL}/api/details/getTwitchStreamerInf/${encodeURIComponent(query)}`
//         );
//         let twitchData: StreamerListType[] = [];
//         if (twitchResponse.ok) {
//           twitchData = await twitchResponse.json();
//           // 各Twitchストリーマーにプラットフォーム情報を追加
//           twitchData = twitchData.map((streamer) => ({
//             ...streamer,
//             platform: 'twitch',
//           }));
//         }

//         // YouTube API
//         const youtubeResponse = await fetch(
//           `${process.env.NEXT_PUBLIC_CURRENT_URL}/api/details/getYoutuberInf/${encodeURIComponent(query)}`
//         );
//         let youtubeData: StreamerListType[] = [];
//         if (youtubeResponse.ok) {
//           youtubeData = await youtubeResponse.json();
//           // 各YouTubeストリーマーにプラットフォーム情報を追加
//           youtubeData = youtubeData.map((streamer) => ({
//             ...streamer,
//             platform: 'youtube',
//           }));
//         }

//         // TwitchとYouTubeのデータを統合
//         const combinedData = [...twitchData, ...youtubeData];

//         // viewer_count順に並び替え（数字のみ比較）
//         const sortedData = combinedData.sort((a, b) => {
//           const viewerA = typeof a.viewer_count === 'number' ? a.viewer_count : parseInt(a.viewer_count) || 0;
//           const viewerB = typeof b.viewer_count === 'number' ? b.viewer_count : parseInt(b.viewer_count) || 0;
//           return viewerB - viewerA;
//         });

//         setFilteredStreamerList(sortedData);
//       } catch (error) {
//         console.error('Error:', error);
//       }
//     }, 1000), // 1秒の遅延
//     [nodes] // 依存配列
//   );

//   useEffect(() => {
//     debouncedFetch(searchStreamerQuery);
//     return debouncedFetch.cancel;
//   }, [searchStreamerQuery, debouncedFetch]);

//   return (
//     <div className="bg-gray-800 p-2 rounded-lg shadow-lg max-w-xl mx-auto">
//       {/* 制限アラートの表示 */}
//       <Snackbar
//         open={showLimitAlert}
//         autoHideDuration={6000}
//         onClose={() => setShowLimitAlert(false)}
//         anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
//       >
//         <Alert
//           onClose={() => setShowLimitAlert(false)}
//           severity="warning"
//           sx={{ width: '100%' }}
//         >
//           配信者の追加は最大10件までです。不要な配信者を削除してから追加してください。
//         </Alert>
//       </Snackbar>

//       {/* データ未発見アラートの表示 */}
//       <Snackbar
//         open={showDataNotFoundAlert}
//         autoHideDuration={6000}
//         onClose={() => setShowDataNotFoundAlert(false)}
//         anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
//       >
//         <Alert
//           onClose={() => setShowDataNotFoundAlert(false)}
//           severity="error"
//           sx={{ width: '100%' }}
//         >
//           データが見つかりませんでした。もう一度お試しください。
//         </Alert>
//       </Snackbar>

//       {/* 重複追加アラートの表示 */}
//       <Snackbar
//         open={showDuplicateAlert}
//         autoHideDuration={6000}
//         onClose={() => setShowDuplicateAlert(false)}
//         anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
//       >
//         <Alert
//           onClose={() => setShowDuplicateAlert(false)}
//           severity="info"
//           sx={{ width: '100%' }}
//         >
//           この配信者は既に追加されています。
//         </Alert>
//       </Snackbar>

//       <div className="mb-0">
//         <input
//           type="text"
//           placeholder="ここに配信者を入力"
//           value={searchStreamerQuery}
//           onChange={(e) => setSearchStreamerQuery(e.target.value)}
//           className="w-full px-3 py-1 mb-0 rounded-lg border-2 border-gray-300 focus:outline-none focus:border-blue-500 transition duration-300 ease-in-out"
//         />
//         {searchStreamerQuery && (
//           <div className="bg-gray-700 p-2 rounded-lg mt-0 relative">
//             <h2 className="text-gray-400 text-xs font-semibold mb-2">検索結果</h2>
//             <div className="max-h-40 overflow-y-auto">
//               {filteredStreamerList.map((streamer) => (
//                 <div
//                   className="flex justify-between items-center bg-gray-600 p-2 mb-1 rounded-lg shadow-md hover:bg-gray-500 transition-all"
//                   key={`${streamer.platform}-${streamer.id}`}
//                 >
//                   <div className="flex items-center">
//                     {/* プラットフォームアイコン */}
//                     {streamer.platform === 'twitch' ? (
//                       <SportsEsportsIcon className="text-purple-500 mr-2" />
//                     ) : (
//                       <YouTubeIcon className="text-red-600 mr-2" />
//                     )}
//                     <div className="text-white font-medium">{streamer.name}</div>
//                   </div>
//                   <div className="flex items-center">
//                     {/* 配信中の場合の赤い点 */}
//                     {streamer.viewer_count !== 'default' && streamer.viewer_count !== -1 && (
//                       <div
//                         className="w-2 h-2 rounded-full bg-red-600 mr-2"
//                         style={{ flexShrink: 0 }}
//                       ></div>
//                     )}
//                     <button
//                       className="relative flex items-center"
//                       onClick={() => handleSearchClick(streamer)}
//                       disabled={isLoading.includes(streamer.id) || streamerIds.length >= MAX_STREAMERS}  // ローディング中や制限時にボタンを無効化
//                       aria-disabled={isLoading.includes(streamer.id) || streamerIds.length >= MAX_STREAMERS}
//                     >
//                       {isLoading.includes(streamer.id) ? (
//                         <>
//                           <CircularProgress size={20} color="inherit" className="p-1 mr-2" />
//                           <span className="text-gray-300 text-sm">
//                             データを追加しています。<br />
//                             これには時間がかかることがあります。
//                           </span>
//                         </>
//                       ) : (
//                         <PlaylistAddIcon
//                           className={`cursor-pointer hover:bg-blue-600 p-1 rounded-full transition-all ${
//                             streamerIds.length >= MAX_STREAMERS ? 'opacity-50 cursor-not-allowed' : ''
//                           }`}
//                         />
//                       )}
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* 追加: ローディングオーバーレイ */}
//             {isLoading.length > 0 && (
//               <div
//                 className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center rounded-lg transition-opacity duration-300"
//                 role="alert"
//                 aria-live="assertive"
//               >
//                 <CircularProgress size={40} color="inherit" className="mb-4" />
//                 <span className="text-white text-lg text-center">
//                   データを追加しています。<br />
//                   これには時間がかかることがあります。
//                 </span>
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* 追加済みの配信者ブロック */}
//       <div className="bg-gray-700 p-2 rounded-lg shadow-lg mt-0">
//         <h2 className="text-white text-lg font-semibold mb-2">追加済みの配信者</h2>
//         {streamerIds.length === 0 ? (
//           <p className="text-gray-400">配信者が追加されていません。追加すると配信者が配信したゲームのアイコンに枠が表示されます</p>
//         ) : (
//           streamerIds.map((streamer) => (
//             <div
//               className="flex justify-between items-center bg-gray-600 p-2 mb-1 rounded-lg shadow-md hover:bg-gray-500 transition-all"
//               key={`${streamer.platform}-${streamer.id}`}
//             >
//               <div className="flex items-center">
//                 {/* 色付きの枠を持つ丸 */}
//                 <div
//                   className="w-10 h-10 rounded-full mr-3 border-4 flex-shrink-0"
//                   style={{
//                     borderColor: streamer.color,
//                     overflow: "hidden",
//                   }}
//                 >
//                   <Image
//                     src={streamer.thumbnail}
//                     alt={`${streamer.name} Thumbnail`}
//                     layout="responsive"
//                     width={16}
//                     height={9}
//                     className="w-full h-full object-cover"
//                   />

//                 </div>
//                 <div className="flex items-center">
//                   {/* プラットフォームアイコン */}
//                   {streamer.platform === 'twitch' ? (
//                     <SportsEsportsIcon className="text-purple-500 mr-2" />
//                   ) : (
//                     <YouTubeIcon className="text-red-600 mr-2" />
//                   )}
//                   <div className="text-white font-medium">{streamer.name}</div>
//                 </div>
//               </div>
//               <DeleteIcon
//                 className="cursor-pointer hover:bg-red-600 p-1 rounded-full transition-all"
//                 onClick={() => handleGameDelete(streamer)}
//               />
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
};

export default StreamedList;