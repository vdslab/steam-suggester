import * as d3 from "d3";
import { Filter, SliderSettings } from "@/types/api/FilterType";
import { SteamDetailsDataType } from "@/types/api/getSteamDetailType";
import { NodeType, LinkType } from "@/types/NetworkType";
import { GAME_COUNT } from "@/constants/NETWORK_DATA";
import fetchWithCache from "./fetchWithCache";

const k = 3;

const getRandomCoordinates = (range: number): { x: number; y: number } => {
  const x = Math.random() * range - range / 2;
  const y = Math.random() * range - range / 2;
  return { x, y };
};

const jaccardSimilarity = (setA: Set<string>, setB: Set<string>): number => {
  const intersection = new Set([...setA].filter((x) => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return union.size === 0 ? -2 : Math.max(Math.min(intersection.size / union.size, 1), 0);
};

export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length === 0 || vecB.length === 0) return -2; 
  const dotProduct = vecA.reduce((acc, val, idx) => acc + val * vecB[idx], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((acc, val) => acc + val * val, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((acc, val) => acc + val * val, 0));
  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  return dotProduct / (magnitudeA * magnitudeB);
}

const createNetwork = async (
  data: SteamDetailsDataType[],
  filter: Filter,
  gameIds: string[],
  slider: SliderSettings
): Promise<{ nodes: NodeType[]; links: LinkType[]; }> => {
  const slicedData = data.slice(0, GAME_COUNT);

  // 追加で取得が必要なゲーム詳細情報を取得
  const promises = gameIds
    .filter((gameId) => !slicedData.find((d) => d.steamGameId === gameId))
    .map(async (gameId, index, array) => {
      const url = `${process.env.NEXT_PUBLIC_CURRENT_URL}/api/details/getSteamGameDetail/${gameId}`;
      try {
        const d: SteamDetailsDataType = await fetchWithCache(url);
        slicedData.push(d);
      } catch (error) {
        console.error(error);
      }
    });

  await Promise.all(promises);

  // フィルターに合致したノード群を抽出
  const rawNodes = slicedData.filter((item) => {
    const isInGenresFilter = item.genres.find((genre) => {
      return filter.Genres[genre]
    });
    return (
      isInGenresFilter &&
      filter.Price.startPrice <= item.price &&
      item.price <= filter.Price.endPrice &&
      ((item.isSinglePlayer && filter.Mode.isSinglePlayer) ||
        (item.isMultiPlayer && filter.Mode.isMultiPlayer)) &&
      ((item.device.windows && filter.Device.windows) || (item.device.mac && filter.Device.mac))
    );
  });

  const nodes: NodeType[] = rawNodes.map((item, i) => {
    const { x, y } = getRandomCoordinates(2000);
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
    return { nodes, links: [] };
  }

  // 類似度行列を計算
  const similarityMatrix: number[][] = [];
  for (let i = 0; i < nodes.length; i++) {
    similarityMatrix[i] = [];
    const setA = new Set(nodes[i].tags ?? []);
    for (let j = 0; j < nodes.length; j++) {
      if (i === j || !nodes[i].similarGames?.find((id) => id === nodes[j].steamGameId)) {
        similarityMatrix[i][j] = -2;
        continue;
      }
      let similarity = cosineSimilarity(nodes[i].featureVector as number[], nodes[j].featureVector as number[]);
      if(similarity === -2) {
        const setA = new Set(nodes[i].tags ?? []);
        const setB = new Set(nodes[j].tags ?? []);
        similarity = jaccardSimilarity(setA, setB);
      }
      similarityMatrix[i][j] = similarity;
    }
  }

  const links: LinkType[] = [];
  const connectionCounts = new Map<number, number>(); // 各ノードの接続数を追跡
  const usedConnections = new Set<string>(); // 接続済みのペアを記録

  nodes.forEach((sourceNode) => {
    const sourceIndex = sourceNode.index;

    // 類似度の降順にソート
    const similarities = similarityMatrix[sourceIndex]
      .map((similarity, targetIndex) => ({ similarity, targetIndex }))
      .filter((d) => d.targetIndex !== sourceIndex)
      .sort((a, b) => b.similarity - a.similarity);

    let addedLinks = 0; // 追加したリンクの数をカウント

    for (const { similarity, targetIndex } of similarities) {
      if (addedLinks >= k || similarity === -2) break; // k本以上の接続を許可しない

      // 接続済みのペアをスキップ
      const linkKey = `${Math.min(sourceIndex, targetIndex)}-${Math.max(sourceIndex, targetIndex)}`;
      if (usedConnections.has(linkKey)) continue;

      // 両ノードが最大5本までの接続を持っている場合はスキップ
      const sourceConnections = connectionCounts.get(sourceIndex) || 0;
      const targetConnections = connectionCounts.get(targetIndex) || 0;
      if (sourceConnections >= k || targetConnections >= k) continue;

      // 接続を作成
      links.push({ source: nodes[sourceIndex], target: nodes[targetIndex] });
      usedConnections.add(linkKey);

      // 接続数を更新
      connectionCounts.set(sourceIndex, sourceConnections + 1);
      connectionCounts.set(targetIndex, targetConnections + 1);

      addedLinks++;
    }
  });


  // ノードサイズ等をスケーリング
  const sizeScale = d3
    .scaleSqrt()
    .domain(d3.extent(nodes, (d) => d.activeUsers) as [number, number])
    .range([1, 6]);

  nodes.forEach((node: NodeType) => {
    node.circleScale = sizeScale(node.activeUsers ?? 0);
  });

  const simulation = d3
    .forceSimulation<NodeType>(nodes)
    .force("charge", d3.forceManyBody<NodeType>().strength(-200))
    .force("center", d3.forceCenter(0, 0).strength(0.05))
    .force(
      "collide",
      d3.forceCollide<NodeType>()
        .radius((d) => (d.circleScale ?? 1) * 30)
        .iterations(3)
    )
    .force(
      "link",
      d3.forceLink<NodeType, LinkType>(links)
        .id((d) => d.index.toString())
        .distance((link) => {
          const sourceNode = link.source as NodeType;
          const targetNode = link.target as NodeType;
          const similarity = similarityMatrix[sourceNode.index][targetNode.index] || 0;
          return 130 - similarity * 100;
        })
        .strength(1)
    )
    .force(
      "radial",
      d3.forceRadial(800).strength(0.1)
    )
    .force(
      "cluster",
      d3.forceManyBody<NodeType>()
        .strength((node) => -25 * (node.circleScale ?? 1))
    );

  while (simulation.alpha() > 0.01) {
    simulation.tick();
  }
  simulation.stop();

  return { nodes, links };
};

export default createNetwork;
