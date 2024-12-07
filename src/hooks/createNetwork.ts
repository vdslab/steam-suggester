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
    { next: { revalidate: ISR_FETCH_INTERVAL } }
  );
  if (!response) {
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

  const matchScale = d3.scaleLinear().domain([0, 100]).range([1, 3]);

  const nodes: NodeType[] = [
    ...new Set(
      data
        .filter((item: SteamDetailsDataType) => {
          // ジャンルid廃止のため一時的にフィルター解除
          // if(!item.genres.find((value: SteamGenreType) => filter["Categories"][value.id])) return false;
          if (!(filter.Price.startPrice <= item.price && item.price <= filter.Price.endPrice))
            return false;
          if (
            !(
              (item.isSinglePlayer && filter.Mode.isSinglePlayer) ||
              (item.isMultiPlayer && filter.Mode.isMultiPlayer)
            )
          )
            return false;
          if (
            !(
              (item.device.windows && filter.Device.windows) ||
              (item.device.mac && filter.Device.mac)
            )
          )
            return false;
          return true;
        })
        .map((item: SteamDetailsDataType, i: number) => {
          return { ...item, index: i, suggestValue: 0 };
        })
    ),
  ];

  let minWeight = Infinity;
  let maxWeight = -Infinity;

  // 全ノードペアの重みを計算し、minWeightとmaxWeightを更新
  const allEdges: { source: number; target: number; weight: number }[] = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const sourceNode = nodes[i];
      const targetNode = nodes[j];
      const weight = calcWeight(sourceNode, targetNode);
      allEdges.push({ source: sourceNode.index, target: targetNode.index, weight });
      if (weight < minWeight) minWeight = weight;
      if (weight > maxWeight) maxWeight = weight;
    }
  }

  const distanceScale = d3
    .scaleLinear()
    .domain([minWeight, maxWeight])
    .range([maxDistance, minDistance]);

  // エッジ候補を類似度（重み）が高い順にソート
  allEdges.sort((a, b) => b.weight - a.weight);

  // 各ノードの現在の接続数をカウントするMap
  const connectionCount: Map<number, number> = new Map();
  nodes.forEach((node) => connectionCount.set(node.index, 0));

  // エッジ追加時の重複防止のためのSet
  const edgeSet: Set<string> = new Set();

  // エッジを順に追加し、各ノードがk個のエッジを持つように制限
  for (const edge of allEdges) {
    const { source, target, weight } = edge;

    // 既にk個のエッジを持つ場合はスキップ
    if ((connectionCount.get(source) || 0) >= k) continue;
    if ((connectionCount.get(target) || 0) >= k) continue;

    // エッジの重複を防止（無向グラフとして扱う）
    const edgeKey =
      source < target ? `${source}-${target}` : `${target}-${source}`;
    if (edgeSet.has(edgeKey)) continue;

    // エッジを追加
    links.push({ source, target, distance: weight > 0 ? distanceScale(weight) : maxDistance });
    edgeSet.add(edgeKey);

    // 接続数を更新
    connectionCount.set(source, (connectionCount.get(source) || 0) + 1);
    connectionCount.set(target, (connectionCount.get(target) || 0) + 1);
  }

  nodes.forEach((node: NodeType) => {
    const overallMatchPercent = calcAllMatchPercentage(filter, node);
    node.circleScale = matchScale(overallMatchPercent);
  });

  nodes.sort((node1: NodeType, node2: NodeType) => (node2?.circleScale ?? 0) - (node1?.circleScale ?? 0));

  const simulation = d3
    .forceSimulation<NodeType>(nodes)
    .force(
      'link',
      d3
        .forceLink<NodeType, LinkType>(links)
        .id((d: NodeType) => d.index)
        .distance((item: LinkType) => {
          return item.distance || maxDistance;
        })
    )
    .force('charge', d3.forceManyBody<NodeType>().strength(-1000)) // 強度調整
    .force(
      'collide',
      d3.forceCollide<NodeType>().radius((d: NodeType) => (d.circleScale ?? 1) * 20)
    ) // 衝突防止
    .force('radial', d3.forceRadial(1000)); // 半径dの円形

  simulation.tick(300).stop();

  nodes.forEach((node: NodeType) => {
    similarGames[node.steamGameId] = [] as { steamGameId: string; twitchGameId: string }[];
 });

  links.forEach((link: LinkType) => {
    type GameType = {
      steamGameId: string;
      twitchGameId: string;
    };
    const sourceGame = nodes.find((n) => n.index === link.source);
    const targetGame = nodes.find((n) => n.index === link.target);

    if (sourceGame && targetGame) {
      const isSourceGameIncluded = similarGames[sourceGame.steamGameId].some(
        (game: GameType) =>
          game.steamGameId === targetGame.steamGameId &&
          game.twitchGameId === targetGame.twitchGameId
      );
      if (!isSourceGameIncluded) {
        similarGames[sourceGame.steamGameId].push({
          steamGameId: targetGame.steamGameId,
          twitchGameId: targetGame.twitchGameId,
        });
      }

      const isTargetGameIncluded = similarGames[targetGame.steamGameId].some(
        (game: GameType) =>
          game.steamGameId === sourceGame.steamGameId &&
          game.twitchGameId === sourceGame.twitchGameId
      );
      if (!isTargetGameIncluded) {
        similarGames[targetGame.steamGameId].push({
          steamGameId: sourceGame.steamGameId,
          twitchGameId: sourceGame.twitchGameId,
        });
      }
    }
  });

  return { nodes, links, similarGames };
};

export default createNetwork;
