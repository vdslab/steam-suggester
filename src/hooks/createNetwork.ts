import * as d3 from "d3";
import { Filter, SliderSettings } from "@/types/api/FilterType";
import { SteamDetailsDataType } from "@/types/api/getSteamDetailType";
import { NodeType, LinkType } from "@/types/NetworkType";
import { CIRCLE_SIZE, GAME_COUNT } from "@/constants/NETWORK_DATA";
import fetchWithCache from "./fetchWithCache";
import { TAG_LIST } from "@/constants/TAG_LIST";

const k = 3;

const FLAT_TAG_LIST_LENGTH = Object.values(TAG_LIST).flat().length;
const emptyElementScores = new Array(FLAT_TAG_LIST_LENGTH).fill(0);

type MatrixType = {
  similarity: number;
  elementScores: number[];
};

const getRandomCoordinates = (range: number): { x: number; y: number } => {
  const x = Math.random() * range - range / 2;
  const y = Math.random() * range - range / 2;
  return { x, y };
};

const jaccardSimilarity = (setA: Set<string>, setB: Set<string>): number => {
  const intersection = new Set([...setA].filter((x) => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return union.size === 0
    ? -2
    : Math.max(Math.min(intersection.size / union.size, 1), 0);
};

export function cosineSimilarityWithDetails(
  vecA: number[],
  vecB: number[],
  WEIGHT_TAG_LIST: number[]
): MatrixType {
  if (vecA.length === 0 || vecB.length === 0) {
    return { similarity: -2, elementScores: [] };
  }

  if (vecA.length !== vecB.length || vecA.length !== WEIGHT_TAG_LIST.length) {
    throw new Error("配列の長さが一致しません");
  }

  const weightedDotProduct = vecA.reduce(
    (acc, val, idx) => acc + val * vecB[idx] * WEIGHT_TAG_LIST[idx],
    0
  );

  const weightedMagnitudeA = Math.sqrt(
    vecA.reduce((acc, val, idx) => acc + val * val * WEIGHT_TAG_LIST[idx], 0)
  );

  const weightedMagnitudeB = Math.sqrt(
    vecB.reduce((acc, val, idx) => acc + val * val * WEIGHT_TAG_LIST[idx], 0)
  );

  if (weightedMagnitudeA === 0 || weightedMagnitudeB === 0) {
    return { similarity: 0, elementScores: vecA.map(() => 0) };
  }

  const similarity =
    weightedDotProduct / (weightedMagnitudeA * weightedMagnitudeB);

  // 各要素ごとの類似スコアを計算
  const elementScores = vecA.map((val, idx) => {
    const weightedNormalizedA =
      (val / weightedMagnitudeA) * WEIGHT_TAG_LIST[idx];
    const weightedNormalizedB =
      (vecB[idx] / weightedMagnitudeB) * WEIGHT_TAG_LIST[idx];
    return weightedNormalizedA * weightedNormalizedB; // 正規化後の値の積 × 重み
  });

  return { similarity, elementScores };
}

const createNetwork = async (
  data: SteamDetailsDataType[] | undefined,
  filter: Filter,
  gameIds: string[],
  slider: SliderSettings
): Promise<{ nodes: NodeType[]; links: LinkType[] }> => {
  if (!data || data === undefined) {
    return { nodes: [], links: [] };
  }
  const slicedData = data.slice(0, GAME_COUNT);

  const WEIGHT_TAG_LIST = Object.keys(TAG_LIST)
    .map((key: string, index) => {
      const size = TAG_LIST[key as keyof typeof TAG_LIST].length;
      let defaultValue = 0;

      if (index === 0 || index === 1 || index === 2) {
        defaultValue = slider.genreWeight / 100;
      } else if (index === 3 || index === 4 || index === 10) {
        defaultValue = slider.graphicWeight / 100;
      } else if (index === 6 || index === 8 || index === 11) {
        defaultValue = slider.playstyleWeight / 100;
      } else if (index === 5 || index === 7 || index === 9 || index === 12) {
        defaultValue = slider.reviewWeight / 100;
      }
      const arr = Array.from({ length: size }, () => defaultValue);
      return arr;
    })
    .flat();

  // 追加で取得が必要なゲーム詳細情報を取得
  const promises = gameIds
    .filter((gameId) => !slicedData.find((d) => d.steamGameId === gameId))
    .map(async (gameId, index, array) => {
      const url = `${process.env.NEXT_PUBLIC_CURRENT_URL}/api/getSteamGameDetail/${gameId}`;
      try {
        const d: SteamDetailsDataType = await fetchWithCache(url);
        console.log(d)
        slicedData.push(d);
      } catch (error) {
        console.error(error);
      }
    });

  await Promise.all(promises);

  // フィルターに合致したノード群を抽出
  const rawNodes = slicedData.filter((item) => {
    const isSinglePlayer =
      !item.isSinglePlayer && !item.isMultiPlayer ? true : item.isSinglePlayer;

    const isInTagsFilter = item.tags?.some((tag) => filter.Tags.includes(tag));

    return (
      !isInTagsFilter &&
      filter.Price.startPrice <= item.price &&
      item.price <= filter.Price.endPrice &&
      ((isSinglePlayer && filter.Mode.isSinglePlayer) ||
        (item.isMultiPlayer && filter.Mode.isMultiPlayer)) &&
      ((item.device.windows && filter.Device.windows) ||
        (item.device.mac && filter.Device.mac))
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
  const similarityMatrix: MatrixType[][] = [];

  for (let i = 0; i < nodes.length; i++) {
    similarityMatrix[i] = [];
    for (let j = 0; j < nodes.length; j++) {
      if (
        i === j ||
        !nodes[i].similarGames?.find((id) => id === nodes[j].steamGameId)
      ) {
        similarityMatrix[i][j] = {
          similarity: -2,
          elementScores: emptyElementScores,
        };
        continue;
      }
      const similarityObject = cosineSimilarityWithDetails(
        nodes[i].featureVector as number[],
        nodes[j].featureVector as number[],
        WEIGHT_TAG_LIST
      );
      if (similarityObject.similarity === -2) {
        const setA = new Set(nodes[i].tags ?? []);
        const setB = new Set(nodes[j].tags ?? []);
        similarityObject.similarity = jaccardSimilarity(setA, setB);
        similarityObject.elementScores = emptyElementScores;
      }
      similarityMatrix[i][j] = similarityObject;
    }
  }

  const links: LinkType[] = [];
  const connectionCounts = new Map<number, number>(); // 各ノードの接続数を追跡
  const usedConnections = new Set<string>(); // 接続済みのペアを記録

  nodes.forEach((sourceNode) => {
    const sourceIndex = sourceNode.index;

    // 類似度の降順にソート
    const similarities = similarityMatrix[sourceIndex]
      .map((similarityObject, targetIndex) => ({
        similarityObject,
        targetIndex,
      }))
      .filter((d) => d.targetIndex !== sourceIndex)
      .sort(
        (a, b) => b.similarityObject.similarity - a.similarityObject.similarity
      );

    let addedLinks = 0; // 追加したリンクの数をカウント

    for (const { similarityObject, targetIndex } of similarities) {
      if (addedLinks >= k || similarityObject.similarity === -2) break; // k本以上の接続を許可しない

      // 接続済みのペアをスキップ
      const linkKey = `${Math.min(sourceIndex, targetIndex)}-${Math.max(
        sourceIndex,
        targetIndex
      )}`;
      if (usedConnections.has(linkKey)) continue;

      // 両ノードが最大5本までの接続を持っている場合はスキップ
      const sourceConnections = connectionCounts.get(sourceIndex) || 0;
      const targetConnections = connectionCounts.get(targetIndex) || 0;
      if (sourceConnections >= k || targetConnections >= k) continue;

      // 接続を作成
      links.push({
        source: nodes[sourceIndex],
        target: nodes[targetIndex],
        similarity: similarityObject.similarity,
        elementScores: similarityObject.elementScores,
      });
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

  // シミュレーションパラメータ
  const baseDistance = 200; // リンクの基本距離
  const similarityFactor = 600; // similarityに応じて距離を減少させる係数
  const minDistance = 10; // リンク距離の最小値（必要に応じて設定）

  const simulation = d3
    .forceSimulation<NodeType>(nodes)
    .force("charge", d3.forceManyBody<NodeType>().strength(-800))
    .force("center", d3.forceCenter(0, 0).strength(0.01))
    .force(
      "collide",
      d3
        .forceCollide<NodeType>()
        .radius((d) => (d.circleScale ?? 1) * (CIRCLE_SIZE + 15))
        .iterations(3)
    )
    .force(
      "link",
      d3
        .forceLink<NodeType, LinkType>(links)
        .id((d) => d.index.toString())
        .distance((link) => {
          const sourceNode = link.source as NodeType;
          const targetNode = link.target as NodeType;
          const similarity =
            similarityMatrix[sourceNode.index][targetNode.index].similarity ||
            0;

          // similarityに基づいてリンク距離を計算
          let distance = baseDistance - similarity * similarityFactor;

          // 距離が最小値を下回らないように制約
          distance = Math.max(distance, minDistance);

          return distance;
        })
        .strength(1) // 強度は変更しない
    )
    .force("radial", d3.forceRadial(1200).strength(0.1))
    .force(
      "cluster",
      d3
        .forceManyBody<NodeType>()
        .strength((node) => -25 * (node.circleScale ?? 1))
    );

  while (simulation.alpha() > 0.01) {
    simulation.tick();
  }
  simulation.stop();

  const similarityScale = d3
    .scaleLinear()
    .domain(d3.extent(links, (link) => link.similarity) as [number, number])
    .range([0, 99]);

  links.forEach((link) => {
    link.similarity = Math.round(similarityScale(link.similarity as number));
  });

  return { nodes, links };
};

export default createNetwork;
