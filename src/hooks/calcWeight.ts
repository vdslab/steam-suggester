import { NodeType } from "@/types/NetworkType";

const calculateCosineSimilarity = (
  vec1: { [word: string]: number },
  vec2: { [word: string]: number }
): number => {
  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;

  const words = new Set([...Object.keys(vec1), ...Object.keys(vec2)]);

  words.forEach((word) => {
    const val1 = vec1[word] || 0;
    const val2 = vec2[word] || 0;
    dotProduct += val1 * val2;
    magnitude1 += val1 * val1;
    magnitude2 += val2 * val2;
  });

  if (magnitude1 === 0 || magnitude2 === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(magnitude1) * Math.sqrt(magnitude2));
};

const isValidReview = (review: any): review is { [word: string]: number } => {
  if (typeof review !== 'object' || review === null) return false;
  return Object.values(review).every(value => typeof value === 'number');
};

const getTagWeight = (tags: string[], index: number): number => {
  return tags.length - index;
};

const calcWeight = (node1: NodeType, node2: NodeType, slider: object): number => {
  console.log(slider);
  let genresWeight = 0;
  const genres1: string[] = node1.genres;
  const genres2: string[] = node2.genres;

  genres1.forEach((genre1: string) => {
    genres2.forEach((genre2: string) => {
      if (genre1 === genre2) {
        genresWeight++;
      }
    });
  });

  let tagsWeight = 0;
  const tags1: string[] = node1.tags;
  const tags2: string[] = node2.tags;

  const tagMap1: { [tag: string]: number } = {};
  tags1.forEach((tag1: string, index1: number) => {
    tagMap1[tag1] = getTagWeight(tags1, index1);
  });

  const tagMap2: { [tag: string]: number } = {};
  tags2.forEach((tag2: string, index2: number) => {
    tagMap2[tag2] = getTagWeight(tags2, index2);
  });

  const commonTags = Object.keys(tagMap1).filter(tag => tagMap2.hasOwnProperty(tag));

  commonTags.forEach(tag => {
    tagsWeight += tagMap1[tag] * tagMap2[tag];
  });

  const genreTagWeight = (genresWeight + tagsWeight) * 10;

  /* const review1 = node1.review;
  const review2 = node2.review;

  let cosineSimilarity = 0;

  if (isValidReview(review1) && isValidReview(review2)) {
    cosineSimilarity = calculateCosineSimilarity(review1, review2);
  } else {
    console.warn('Invalid review format. Setting cosineSimilarity to 0.');
  }

  const similarityWeight = cosineSimilarity * 100; */

  const totalWeightCalculated = 0.7 * genreTagWeight;

  return totalWeightCalculated;
};

export default calcWeight;
