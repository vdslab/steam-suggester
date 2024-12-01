import * as d3 from 'd3';
import { Filter } from '@/types/api/FilterType';
import { ISR_FETCH_INTERVAL } from '@/constants/DetailsConstants';
import { calcAllMatchPercentage } from '@/components/common/CalcMatch';
import { LinkType, NodeType } from '@/types/NetworkType';
import { SteamDetailsDataType } from '@/types/api/getSteamDetailType';
import { SimilarGameType } from '@/types/NetworkType';

import calcWeight from '@/hooks/calcWeight';

const createNetwork = async (filter: Filter, gameIds: string[]) => {
  const k = 4;
  const minDistance = 50;
  const maxDistance = 300;

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
    // ジャンルid廃止のため一時的にフィルター解除
    // if(!item.genres.find((value: SteamGenreType) => filter["Categories"][value.id])) return false;
    if(!(filter.Price.startPrice <= item.price && item.price <= filter.Price.endPrice)) return false;
    if(!((item.isSinglePlayer && filter.Mode.isSinglePlayer) || (item.isMultiPlayer && filter.Mode.isMultiPlayer))) return false;
    if(!((item.device.windows && filter.Device.windows) || (item.device.mac && filter.Device.mac))) return false;
    return true;
  }).map((item: SteamDetailsDataType, i: number) => {return {...item, index: i, suggestValue: 0}}))];

  console.log(nodes);

  let minWeight = Infinity;
  let maxWeight = -Infinity;

  nodes.forEach((sourceNode: NodeType) => {
    nodes
      .filter(targetNode => sourceNode !== targetNode)
      .forEach((targetNode) => {
        const weight = calcWeight(sourceNode, targetNode);
        if(weight < minWeight) minWeight = weight;
        if(weight > maxWeight) maxWeight = weight;
      });
  });

  const distanceScale = d3.scaleLinear()
                          .domain([minWeight, maxWeight])
                          .range([maxDistance, minDistance]);

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
        weight: calcWeight(sourceNode, targetNode)
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
            const weight = calcWeight(sourceNode, targetNode);
            return weight > 0 ? distanceScale(weight) : maxDistance;
          }
          return maxDistance;
        })
    )
    .force("charge", d3.forceManyBody<NodeType>().strength(-1000))  // 強度調整
    .force("collide", d3.forceCollide<NodeType>().radius((d: NodeType) => (d.circleScale ?? 1) * 20)) // 衝突防止
    .force("radial", d3.forceRadial(1000)); // 半径dの円形

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