import { NodeType } from "@/types/NetworkType";

export const tagSimilarity = (tagsA: string[], tagsB: string[]): number => {
  const setA = new Set(tagsA);
  const setB = new Set(tagsB);
  const intersection = new Set([...setA].filter(tag => setB.has(tag)));
  const union = new Set([...setA, ...setB]);
  return intersection.size / union.size;
};

export const calculateSimilarityMatrix = (nodes: NodeType[]): number[][] => {
  return nodes.map(sourceNode =>
    nodes.map(targetNode =>
      sourceNode === targetNode ? 0 : tagSimilarity(sourceNode.tags, targetNode.tags)
    )
  );
};
