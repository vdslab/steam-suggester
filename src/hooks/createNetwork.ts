import * as d3 from 'd3';
import { Filter } from '@/types/api/FilterType';
import { ISR_FETCH_INTERVAL } from '@/constants/DetailsConstants';
import { calcAllMatchPercentage } from '@/components/common/CalcMatch';
import { LinkType, NodeType } from '@/types/NetworkType';
import { SteamDetailsDataType, SteamGenreType } from '@/types/api/getSteamDetailType';
import { SimilarGameType } from '@/types/NetworkType';


const calcCommonGenres = (game1: SteamGenreType[], game2: SteamGenreType[]) => {
  let genresWeight = 1;

  game1.forEach((g1: SteamGenreType) =>
    game2.forEach((g2: SteamGenreType) => {
      if(g1.id === g2.id) {
        genresWeight++;
      }
    })
  );
  genresWeight *= 10;

  return 1 / genresWeight;
};

const createNetwork = async (filter: Filter, gameIds: string[]) => {
  const k = 4;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_CURRENT_URL}/api/network/getMatchGames`,
    {next: { revalidate: ISR_FETCH_INTERVAL }}
  );
  if(!response) {
    return {};
  }
  const data: SteamDetailsDataType[] = await response.json();

  const promises = gameIds
    .filter((gameId: string) => 
      !data.find((d: SteamDetailsDataType) => d.steamGameId === gameId)
    )
    .map(async (gameId: string) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_CURRENT_URL}/api/details/getSteamGameDetail/${gameId}`,
        { next: { revalidate: ISR_FETCH_INTERVAL } }
      );
      const d = await res.json();
      data.push(d);
    });

  await Promise.all(promises);

  const links: LinkType[] = [];
  const similarGames: SimilarGameType = {};

  const matchScale = d3.scaleLinear()
                      .domain([0, 100])
                      .range([1, 3])

  const nodes: NodeType[] = [...new Set(data.filter((item: SteamDetailsDataType) => {
    if(!item.genres.find((value: SteamGenreType) => filter["Categories"][value.id])) return false;
    if(!(filter.Price.startPrice <= item.price && item.price <= filter.Price.endPrice)) return false;
    if(!((item.isSinglePlayer && filter.Mode.isSinglePlayer) || (item.isMultiPlayer && filter.Mode.isMultiPlayer))) return false;
    if(!((item.device.windows && filter.Device.windows) || (item.device.mac && filter.Device.mac))) return false;
    return true;
  }).map((item: SteamDetailsDataType, i: number) => {return {...item, index: i}}))];

  const canAddLink = (links: LinkType[], sourceIndex: number, targetIndex: number): boolean => {
    const sourceConnections = links.filter(item => item.source === sourceIndex || item.target === sourceIndex).length;
    const targetConnections = links.filter(item => item.source === targetIndex || item.target === targetIndex).length;
    
    return sourceIndex !== targetIndex && sourceConnections < k && targetConnections < k;
  }

  nodes.forEach((sourceNode: NodeType) => {
    const weightedNodes = nodes
      .filter(targetNode => sourceNode !== targetNode)
      .map((targetNode) => ({
        node: targetNode,
        weight: calcCommonGenres(sourceNode.genres, targetNode.genres),
      }))
      .sort((a, b) => b.weight - a.weight);

    let addedLinks = 0;
    for(const { node: targetNode } of weightedNodes) {
      if(addedLinks >= k) break;

      if(canAddLink(links, sourceNode.index, targetNode.index)) {
        links.push({ source: sourceNode.index, target: targetNode.index });
        addedLinks++;
      }
    }
  });

  nodes.forEach((node) => {
    let sourceConnections = links.filter((link: LinkType) => link.source === node.index || link.target === node.index).length;

    if(sourceConnections < k) {
      for(const targetNode of nodes) {
        if(sourceConnections >= k) break;

        if(canAddLink(links, node.index, targetNode.index)) {
          links.push({ source: node.index, target: targetNode.index });
          sourceConnections++;
        }
      }
    }
  });

  nodes.forEach((node: NodeType) => {
    // 一致度を計算(全体)
    const overallMatchPercent = calcAllMatchPercentage(filter, node);
    node.circleScale = matchScale(overallMatchPercent);
  });

  nodes.sort((node1: NodeType, node2: NodeType) => (node2?.circleScale ?? 0) - (node1?.circleScale ?? 0));

  const simulation = d3
    .forceSimulation<NodeType>(nodes)
    .force(
      "link",
      d3
        .forceLink<NodeType, LinkType>(links)
        .id((d: NodeType) => d.index)
        .distance((item: LinkType) => {
          const sourceNode = item.source as NodeType;
          const targetNode = item.target as NodeType;
          
          if(typeof sourceNode !== "number" && typeof targetNode !== "number") {
            return calcCommonGenres(sourceNode.genres, targetNode.genres);
          }
          return 0;
        })
    )
    .force("charge", d3.forceManyBody<NodeType>().strength(-1000))
    .force("collide", d3.forceCollide<NodeType>().radius((d: NodeType) => (d.circleScale ?? 1) * 20));

  simulation.tick(300).stop();

  nodes.forEach((node: NodeType) => {
    similarGames[node.steamGameId] = [] as { steamGameId: string; twitchGameId: string }[];
  })

  links.forEach((link: LinkType) => {
    type GameType = {
      steamGameId: string;
      twitchGameId: string;
    }
    const sourceGame = link.source as NodeType;
    const targetGame = link.target as NodeType;
  
    const isSourceGameIncluded = similarGames[sourceGame.steamGameId].some((game: GameType) => 
      game.steamGameId === targetGame.steamGameId && game.twitchGameId === targetGame.twitchGameId
    );
    if(!isSourceGameIncluded) {
      similarGames[sourceGame.steamGameId].push({ steamGameId: targetGame.steamGameId, twitchGameId: targetGame.twitchGameId });
    }
  
    const isTargetGameIncluded = similarGames[targetGame.steamGameId].some((game: GameType) =>
      game.steamGameId === sourceGame.steamGameId && game.twitchGameId === sourceGame.twitchGameId
    );
    if(!isTargetGameIncluded) {
      similarGames[targetGame.steamGameId].push({ steamGameId: sourceGame.steamGameId, twitchGameId: sourceGame.twitchGameId });
    }
  });

  return {nodes, links, similarGames};
};

export default createNetwork;