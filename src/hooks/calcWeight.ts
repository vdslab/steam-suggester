import { SteamGenreType } from "@/types/api/getSteamDetailType";
import { NodeType } from "@/types/NetworkType";

const calcWeight = (node1: NodeType, node2: NodeType) => {
  let totalWeight = 1;

  let genresWeight = 0;
  const genres1: SteamGenreType[] = node1.genres;
  const genres2: SteamGenreType[] = node2.genres;

  genres1.forEach((genre1: SteamGenreType) => {
    genres2.forEach((genre2: SteamGenreType) => {
      if(genre1.id === genre2.id) {
        genresWeight++;
      }
    });
  });

  let tagsWeight = 0;
  const tags1: string[] = node1.tags;
  const tags2: string[] = node2.tags;

  tags1.forEach((tag1: string) => {
    tags2.forEach((tag2: string) => {
      if (tag1 === tag2) {
        tagsWeight += 1;
      }
    });
  });

  totalWeight += (genresWeight + tagsWeight) * 10;

  return totalWeight;
}

export default calcWeight;