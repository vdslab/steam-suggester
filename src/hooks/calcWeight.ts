import { NodeType } from "@/types/NetworkType";

const calcWeight = (node1: NodeType, node2: NodeType) => {
  let totalWeight = 1;

  let genresWeight = 0;
  const genres1: string[] = node1.genres;
  const genres2: string[] = node2.genres;

  genres1.forEach((genre1: string) => {
    genres2.forEach((genre2: string) => {
      if(genre1 === genre2) {
        genresWeight++;
      }
    });
  });

  let tagsWeight = 0;
  const tags1: string[] = node1.tags;
  const tags2: string[] = node2.tags;

  tags1.forEach((tag1: string, index1: number) => {
    tags2.forEach((tag2: string, index2: number) => {
      if (tag1 === tag2) {
        tagsWeight += (tags1.length - index1) + (tags2.length - index2);
      }
    });
  });

  

  totalWeight += (genresWeight + tagsWeight) * 10;

  return totalWeight;
}

export default calcWeight;