import { NodeType } from "@/types/NetworkType";
import { SliderSettings } from "@/types/api/FilterType";
import { TAG_LIST } from "@/constants/TAG_LIST";

// 特定のジャンルに重みを追加
const SPECIAL_GENRES = ["レース"];
const SPECIAL_GENRE_WEIGHT = 10.0;

// スライダーの値に基づいた重み計算
export const calculateTagWeights = (slider: SliderSettings): Map<string, number> => {
  const tagWeights = new Map<string, number>();

  const genreWeight = slider.genreWeight / 100;
  const graphicWeight = slider.graphicWeight / 100;
  const playstyleWeight = slider.playstyleWeight / 100;

  const genreTags = [...(TAG_LIST["ジャンル"] || []), ...(TAG_LIST["サブジャンル"] || [])];
  const graphicTags = [...(TAG_LIST["ビジュアルと視点"] || []), ...(TAG_LIST["テーマと雰囲気"] || [])];
  const playstyleTags = [...(TAG_LIST["プレイヤー"] || []), ...(TAG_LIST["プレイスタイル"] || [])];

  genreTags.forEach(tag => {
    const weight = SPECIAL_GENRES.includes(tag) ? genreWeight * SPECIAL_GENRE_WEIGHT : genreWeight;
    tagWeights.set(tag, weight);
  });
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
      similarity += tagWeights.get(tag) || 0;
    }
  });

  return similarity;
};

// ノード間の類似性マトリクスを計算
export const calculateSimilarityMatrix = (
  nodes: NodeType[],
  slider: SliderSettings
): number[][] => {
  const tagWeights = calculateTagWeights(slider);

  return nodes.map(sourceNode =>
    nodes.map(targetNode => {
      if (sourceNode === targetNode) return 0;

      // タグの類似性を計算
      const tagSim = tagSimilarity(sourceNode.tags, targetNode.tags, tagWeights);

      // シングルプレイヤーとマルチプレイヤーの一致度を加味
      const playerSim =
        (sourceNode.isSinglePlayer === targetNode.isSinglePlayer ? 0.5 : 0) +
        (sourceNode.isMultiPlayer === targetNode.isMultiPlayer ? 0.5 : 0);

      return tagSim + playerSim;
    })
  );
};
