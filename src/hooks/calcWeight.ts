import { NodeType } from "@/types/NetworkType";
import { SliderSettings } from "@/types/api/FilterType";
import { TAG_LIST } from "@/constants/TAG_LIST";

// タグの重みを計算
export const calculateTagWeights = (slider: SliderSettings): Map<string, number> => {
  const tagWeights = new Map<string, number>();

  const totalWeight = slider.genreWeight + slider.graphicWeight + slider.playstyleWeight;

  // スライダーの合計が0の場合を考慮
  const genreWeight = totalWeight > 0 ? (slider.genreWeight / totalWeight) * 100 : 0;
  const graphicWeight = totalWeight > 0 ? (slider.graphicWeight / totalWeight) * 100 : 0;
  const playstyleWeight = totalWeight > 0 ? (slider.playstyleWeight / totalWeight) * 100 : 0;

  const genreTags = [...(TAG_LIST["ジャンル"] || []), ...(TAG_LIST["サブジャンル"] || [])];
  const graphicTags = [...(TAG_LIST["ビジュアルと視点"] || []), ...(TAG_LIST["テーマと雰囲気"] || [])];
  const playstyleTags = [...(TAG_LIST["プレイヤー"] || []), ...(TAG_LIST["プレイスタイル"] || [])];

  const playstyleTagWeights: { [key: string]: number } = {
    "シングルプレイヤー": 0.5,
    "ローカル4プレイヤー": 0.8,
    "非同期マルチプレイヤー": 0.6,
    "協力プレイ": 0.9,
    "協力キャンペーン": 0.5,
    "ローカル協力プレイ": 0.7,
    "ローカルマルチプレイヤー": 0.5,
    "MMO": 0.5,
    "マルチプレイヤー": 0.5,
    "オンライン協力プレイ": 0.8,
    "バトルロイヤル": 1,
    "MOBA": 0.6,
    "MMORPG": 1,
    "PvP": 0.7,
    "PvE": 0.6,
    "チーム制": 0.8,
    "クラス制": 0.7
  };

  genreTags.forEach((tag) => tagWeights.set(tag, genreWeight));
  graphicTags.forEach((tag) => tagWeights.set(tag, graphicWeight));
  playstyleTags.forEach((tag) => {
    const adjustedWeight = playstyleWeight * (playstyleTagWeights[tag] || 1);
    tagWeights.set(tag, adjustedWeight);
  });

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
  setSource.forEach((tag) => {
    if (setTarget.has(tag)) {
      similarity += tagWeights.get(tag) || 0;
    }
  });

  return similarity;
};

export const reviewSimilarity = (
  sourceReview: { [word: string]: number },
  targetReview: { [word: string]: number }
): number => {
  const sourceWords = Object.keys(sourceReview);
  const targetWords = Object.keys(targetReview);
  const commonWords = sourceWords.filter((word) => targetWords.includes(word));

  let dotProduct = 0;
  let sourceMagnitude = 0;
  let targetMagnitude = 0;

  commonWords.forEach((word) => {
    dotProduct += (sourceReview[word] || 0) * (targetReview[word] || 0);
  });

  sourceWords.forEach((word) => {
    sourceMagnitude += Math.pow(sourceReview[word] || 0, 2);
  });

  targetWords.forEach((word) => {
    targetMagnitude += Math.pow(targetReview[word] || 0, 2);
  });

  sourceMagnitude = Math.sqrt(sourceMagnitude);
  targetMagnitude = Math.sqrt(targetMagnitude);

  return sourceMagnitude && targetMagnitude ? dotProduct / (sourceMagnitude * targetMagnitude) : 0;
};

// ノード間の類似性マトリクスを計算
export const calculateSimilarityMatrix = (
  nodes: NodeType[],
  slider: SliderSettings
): number[][] => {
  const totalWeight = slider.genreWeight + slider.reviewWeight;

  // スライダーの合計が0の場合を考慮
  const tagWeightRatio = totalWeight > 0 ? slider.genreWeight / totalWeight : 0;
  const reviewWeightRatio = totalWeight > 0 ? slider.reviewWeight / totalWeight : 0;

  const tagWeights = calculateTagWeights(slider);

  return nodes.map((sourceNode) =>
    nodes.map((targetNode) => {
      if (sourceNode === targetNode) return 0;

      // タグの類似性を計算
      const tagSim = tagSimilarity(sourceNode.tags, targetNode.tags, tagWeights) * tagWeightRatio;

      // レビューの類似性を計算
      const reviewSim = reviewSimilarity(sourceNode.review, targetNode.review) * reviewWeightRatio;

      // シングルプレイヤーとマルチプレイヤーの一致度を加味
      const playerSim =
        (sourceNode.isSinglePlayer === targetNode.isSinglePlayer ? 0.5 : 0) +
        (sourceNode.isMultiPlayer === targetNode.isMultiPlayer ? 0.5 : 0);

      // 全体の類似性を統合
      return tagSim + reviewSim + playerSim;
    })
  );
};
