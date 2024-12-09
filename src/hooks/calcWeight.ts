import { NodeType } from "@/types/NetworkType";
import { SliderSettings } from "@/types/api/FilterType";
import { TAG_LIST } from "@/constants/TAG_LIST";

// スライダーの値に基づいた重み計算
export const calculateTagWeights = (slider: SliderSettings): Map<string, number> => {
  const tagWeights = new Map<string, number>();

  const genreWeight = slider.genreWeight / 100; // スライダーの値を 0～1 に正規化
  const graphicWeight = slider.graphicWeight / 100;
  const playstyleWeight = slider.playstyleWeight / 100;

  const genreTags = [...(TAG_LIST["ジャンル"] || []), ...(TAG_LIST["サブジャンル"] || []), ...(TAG_LIST["特徴"] || []), ...(TAG_LIST["その他のタグ"] || [])];
  const graphicTags = [...(TAG_LIST["ビジュアルと視点"] || []), ...(TAG_LIST["テーマと雰囲気"] || [])];
  const playstyleTags = [...(TAG_LIST["プレイスタイル"] || []), ...(TAG_LIST["プレイヤー"] || [])];

  // 各タグに重みを設定
  genreTags.forEach(tag => tagWeights.set(tag, genreWeight));
  graphicTags.forEach(tag => tagWeights.set(tag, graphicWeight));
  playstyleTags.forEach(tag => tagWeights.set(tag, playstyleWeight));

  return tagWeights;
};

// タグ間の類似性を計算
export const tagSimilarity = (
  sourceTags: string[],
  targetTags: string[],
  tagWeights: Map<string, number>
): number => {
  const setSource = new Set(sourceTags);
  const setTarget = new Set(targetTags);

  let similarity = 0;
  setSource.forEach(tag => {
    if (setTarget.has(tag)) {
      similarity += tagWeights.get(tag) || 0; // タグが一致している場合に重みを加算
    }
  });

  return similarity;
};

// シングルプレイヤー・マルチプレイヤーの一致度を計算
const playerStyleSimilarity = (
  sourceNode: NodeType,
  targetNode: NodeType,
  playstyleWeight: number
): number => {
  let similarity = 0;

  if (sourceNode.isSinglePlayer && targetNode.isSinglePlayer) {
    similarity += 0.5 * playstyleWeight; // シングルプレイヤーが一致している場合
  }
  if (sourceNode.isMultiPlayer && targetNode.isMultiPlayer) {
    similarity += 0.5 * playstyleWeight; // マルチプレイヤーが一致している場合
  }

  return similarity;
};

// ノード間の類似性マトリクスを計算
export const calculateSimilarityMatrix = (
  nodes: NodeType[],
  slider: SliderSettings
): number[][] => {
  const tagWeights = calculateTagWeights(slider); // スライダーに基づいて重みを取得
  const playstyleWeight = slider.playstyleWeight / 100;

  return nodes.map(sourceNode =>
    nodes.map(targetNode => {
      if (sourceNode === targetNode) return 0;

      // タグの類似性
      const tagSim = tagSimilarity(sourceNode.tags, targetNode.tags, tagWeights);

      // シングル・マルチプレイヤーの一致度
      const playerSim = playerStyleSimilarity(sourceNode, targetNode, playstyleWeight);

      return tagSim + playerSim;
    })
  );
};
