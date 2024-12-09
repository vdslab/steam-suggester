import * as d3 from "d3";
import { Filter, SliderSettings } from "@/types/api/FilterType";
import { ISR_FETCH_INTERVAL } from "@/constants/DetailsConstants";
import { SteamDetailsDataType } from "@/types/api/getSteamDetailType";
import { SimilarGameType, NodeType, LinkType } from "@/types/NetworkType";
import { calculateSimilarityMatrix } from "@/hooks/calcWeight";

const k = 4;

const getRandomCoordinates = (range: number): { x: number; y: number } => {
  const x = Math.random() * range - range / 2;
  const y = Math.random() * range - range / 2;
  return { x, y };
};

const createNetwork = async (
  filter: Filter,
  gameIds: string[],
  slider: SliderSettings
): Promise<{ nodes: NodeType[]; links: LinkType[]; similarGames: SimilarGameType }> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_CURRENT_URL}/api/network/getMatchGames`,
    { next: { revalidate: ISR_FETCH_INTERVAL } }
  );

  if (!response.ok) {
    return { nodes: [], links: [], similarGames: {} };
  }

  const data: SteamDetailsDataType[] = await response.json();

  const promises = gameIds
    .filter((gameId) => !data.find((d) => d.steamGameId === gameId))
    .map(async (gameId) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_CURRENT_URL}/api/details/getSteamGameDetail/${gameId}`,
        { next: { revalidate: ISR_FETCH_INTERVAL } }
      );
      if (res.ok) {
        const d: SteamDetailsDataType = await res.json();
        data.push(d);
      }
    });

  await Promise.all(promises);

  const rawNodes = data.filter((item) => {
    return (
      filter.Price.startPrice <= item.price &&
      item.price <= filter.Price.endPrice &&
      ((item.isSinglePlayer && filter.Mode.isSinglePlayer) ||
        (item.isMultiPlayer && filter.Mode.isMultiPlayer)) &&
      ((item.device.windows && filter.Device.windows) || (item.device.mac && filter.Device.mac))
    );
  });

  const nodes: NodeType[] = rawNodes.map((item, i) => {
    const { x, y } = getRandomCoordinates(1000); // ランダムな初期座標を設定
    return {
      ...item,
      index: i,
      suggestValue: 0,
      x,
      y,
      vx: 0,
      vy: 0,
    };
  });

  if (nodes.length === 0) {
    return { nodes, links: [], similarGames: {} };
  }

  const similarityMatrix = calculateSimilarityMatrix(nodes, slider);

  const clusterCenters = new Map<number, { x: number; y: number }>();
  nodes.forEach((node, i) => {
    if (!clusterCenters.has(i)) {
      clusterCenters.set(i, getRandomCoordinates(2000)); // クラスタ中心を分散
    }
  });

  const clusterForce = (alpha: number) => {
    const strength = 0.1;
    nodes.forEach((sourceNode, i) => {
      const targetIndex = similarityMatrix[i].reduce(
        (bestIndex, score, index) =>
          score > similarityMatrix[i][bestIndex] ? index : bestIndex,
        0
      );

      const clusterCenter = clusterCenters.get(targetIndex);
      if (clusterCenter) {
        const dx = clusterCenter.x - (sourceNode.x ?? 0);
        const dy = clusterCenter.y - (sourceNode.y ?? 0);
        sourceNode.vx = (sourceNode.vx ?? 0) + dx * strength * alpha;
        sourceNode.vy = (sourceNode.vy ?? 0) + dy * strength * alpha;
      }
    });
  };

  const sizeScale = d3.scaleSqrt()
    .domain(d3.extent(nodes, (d) => d.totalViews) as [number, number])
    .range([1, 4]);

  nodes.forEach((node: NodeType) => {
    node.circleScale = sizeScale(node.totalViews ?? 0);
  });

  const simulation = d3.forceSimulation(nodes)
    .force("charge", d3.forceManyBody<NodeType>().strength(-200)) // 強い引力でノード間を広げる
    .force("center", d3.forceCenter(0, 0)) // 中心に配置
    .force("collide", d3.forceCollide<NodeType>().radius((d) => (d.circleScale ?? 1) * 30)) // 衝突半径を拡大
    .on("tick", () => {
      clusterForce(simulation.alpha());
    });

  await new Promise<void>((resolve) => {
    simulation.on("end", function () {
      resolve();
    });
  });

  simulation.stop();

  const links: LinkType[] = [];

  const connectionCount = new Map<number, number>();

  nodes.forEach((sourceNode) => {
    const sourceIndex = sourceNode.index;

    const distances = nodes
      .filter((targetNode) => targetNode !== sourceNode)
      .map((targetNode) => ({
        targetNode,
        distance: Math.sqrt(
          Math.pow((sourceNode.x ?? 0) - (targetNode.x ?? 0), 2) +
          Math.pow((sourceNode.y ?? 0) - (targetNode.y ?? 0), 2)
        ),
      }))
      .sort((a, b) => a.distance - b.distance);

    let addedLinks = 0;
    distances.forEach(({ targetNode }) => {
      const targetIndex = targetNode.index;

      const sourceConnections = connectionCount.get(sourceIndex) ?? 0;
      const targetConnections = connectionCount.get(targetIndex) ?? 0;

      if (sourceConnections < k && targetConnections < k) {
        links.push({
          source: sourceIndex,
          target: targetIndex,
        });

        connectionCount.set(sourceIndex, sourceConnections + 1);
        connectionCount.set(targetIndex, targetConnections + 1);

        addedLinks++;

        if (addedLinks >= k) return;
      }
    });
  });

  const similarGames: SimilarGameType = {};
  nodes.forEach((sourceNode) => {
    const sourceId = sourceNode.steamGameId;
    similarGames[sourceId] = [];

    links.forEach((link) => {
      const targetNode =
        link.source === sourceNode.index
          ? nodes[link.target as number]
          : link.target === sourceNode.index
          ? nodes[link.source as number]
          : null;

      if (targetNode) {
        similarGames[sourceId].push({
          steamGameId: targetNode.steamGameId,
          twitchGameId: targetNode.twitchGameId,
        });
      }
    });
  });

  return { nodes, links, similarGames };
};

export default createNetwork;
