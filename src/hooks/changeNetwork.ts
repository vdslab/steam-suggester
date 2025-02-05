import * as d3 from "d3";
import { Filter, SliderSettings } from "@/types/api/FilterType";
import { SteamDetailsDataType } from "@/types/api/getSteamDetailType";
import { NodeType, LinkType } from "@/types/NetworkType";
import { CIRCLE_SIZE, GAME_COUNT } from "@/constants/NETWORK_DATA";
import fetchWithCache from "./fetchWithCache";
import { TAG_LIST } from "@/constants/TAG_LIST";

//============= 定数など =============//
const k = 3; // 各ノードが持つリンク数の目安
const FLAT_TAG_LIST_LENGTH = Object.values(TAG_LIST).flat().length;
const emptyElementScores = new Array(FLAT_TAG_LIST_LENGTH).fill(0);

//============= ツール関数群 =============//

/**
 * ランダム座標生成
 */
const getRandomCoordinates = (range: number): { x: number; y: number } => {
  const x = Math.random() * range - range / 2;
  const y = Math.random() * range - range / 2;
  return { x, y };
};

/**
 * Jaccard類似度
 */
const jaccardSimilarity = (setA: Set<string>, setB: Set<string>): number => {
  const intersection = new Set([...setA].filter((x) => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return union.size === 0
    ? -2
    : Math.max(Math.min(intersection.size / union.size, 1), 0);
};

/**
 * コサイン類似度 (重み付き + 詳細スコア)
 */
type MatrixType = {
  similarity: number;
  elementScores: number[];
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

  // 重み付きのドット積
  const weightedDotProduct = vecA.reduce(
    (acc, val, idx) => acc + val * vecB[idx] * WEIGHT_TAG_LIST[idx],
    0
  );

  // 各ベクトルの重み付き大きさ
  const weightedMagnitudeA = Math.sqrt(
    vecA.reduce((acc, val, idx) => acc + val * val * WEIGHT_TAG_LIST[idx], 0)
  );
  const weightedMagnitudeB = Math.sqrt(
    vecB.reduce((acc, val, idx) => acc + val * val * WEIGHT_TAG_LIST[idx], 0)
  );

  // どちらかが0ベクトルなら類似度0扱い
  if (weightedMagnitudeA === 0 || weightedMagnitudeB === 0) {
    return { similarity: 0, elementScores: vecA.map(() => 0) };
  }

  // 類似度の計算
  const similarity =
    weightedDotProduct / (weightedMagnitudeA * weightedMagnitudeB);

  // 要素ごとの類似度スコア（可視化などに利用可能）
  const elementScores = vecA.map((val, idx) => {
    const weightedNormalizedA =
      (val / weightedMagnitudeA) * WEIGHT_TAG_LIST[idx];
    const weightedNormalizedB =
      (vecB[idx] / weightedMagnitudeB) * WEIGHT_TAG_LIST[idx];
    return weightedNormalizedA * weightedNormalizedB;
  });

  return { similarity, elementScores };
}

/**
 * ネットワークの更新を行う関数
 *
 * @param data Steam 詳細データ一覧
 * @param filter 絞り込み用のフィルターオブジェクト
 * @param gameIds フェッチ対象のゲームIDリスト
 * @param slider 類似度計算に用いる重み設定
 * @param existingNodes 既存のノード配列（位置や速度を保持してアニメーションを継続するため）
 * @returns { nodes, links, simulation }
 */
export default async function changeNetwork(
  data: SteamDetailsDataType[] | undefined,
  filter: Filter,
  gameIds: string[],
  slider: SliderSettings,
  existingNodes: NodeType[]
): Promise<{
  nodes: NodeType[];
  links: LinkType[];
}> {
  // データがなければ空を返す
  if (!data || data === undefined) {
    return {
      nodes: [],
      links: [],
    };
  }

  // 取得するデータ件数を制限（例：GAME_COUNT まで）
  const slicedData = data.slice(0, GAME_COUNT);

  // スライダーの値をTAG_LIST構造に合わせて配列化
  const WEIGHT_TAG_LIST = Object.keys(TAG_LIST)
    .map((key: string, index) => {
      const size = TAG_LIST[key as keyof typeof TAG_LIST].length;
      let defaultValue = 0;

      // ここは TAG_LIST の構造/用途にあわせて自由に変更
      // index と slider の各 Weight を使って重みづけする例
      if (index === 0 || index === 1 || index === 2) {
        defaultValue = slider.genreWeight / 100;
      } else if (index === 3 || index === 4 || index === 10) {
        defaultValue = slider.graphicWeight / 100;
      } else if (index === 6 || index === 8 || index === 11) {
        defaultValue = slider.playstyleWeight / 100;
      } else if (index === 5 || index === 7 || index === 9 || index === 12) {
        defaultValue = slider.reviewWeight / 100;
      }

      return Array.from({ length: size }, () => defaultValue);
    })
    .flat();

  // 追加取得が必要なゲーム詳細をフェッチ
  const promises = gameIds
    .filter((gameId) => !slicedData.find((d) => d.steamGameId === gameId))
    .map(async (gameId) => {
      const url = `${process.env.NEXT_PUBLIC_CURRENT_URL}/api/getSteamGameDetail/${gameId}`;
      try {
        const d: SteamDetailsDataType = await fetchWithCache(url);
        slicedData.push(d);
      } catch (error) {
        console.error(error);
      }
    });
  await Promise.all(promises);


  // フィルターに合致するデータだけ取り出す
  const rawNodes = slicedData.filter((item) => {
    // シングルプレイ/マルチプレイ設定に合わせる
    const isSinglePlayer =
      !item.isSinglePlayer && !item.isMultiPlayer ? true : item.isSinglePlayer;

    // 除外タグに合致するかどうか
    const isInTagsFilter = item.tags?.some((tag) => filter.Tags.includes(tag));

    // 価格帯 + プレイモード + デバイス対応をチェック
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

  // 既存ノードをマップ化しておく: steamGameId -> Node
  const existingNodeMap = new Map<string, NodeType>();
  existingNodes.forEach((node) => {
    if (node.steamGameId) {
      existingNodeMap.set(node.steamGameId, node);
    }
  });

  // rawNodes をもとに、新規の nodes 配列を作成
  // - 既存ノードがあれば位置情報を継承
  // - ない場合はランダム配置
  const nodes: NodeType[] = rawNodes.map((item, i) => {
    const existingNode = existingNodeMap.get(item.steamGameId);

    if (existingNode) {
      // 既存ノードの位置・速度などを再利用しつつ最新情報を上書き
      return {
        ...existingNode,
        ...item, // SteamDetailsDataType由来の最新情報をマージ（例：price, tagsなど）
        index: i, // index は再計算して振り直す
      };
    } else {
      // 存在しない場合は新規作成 + ランダム配置
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
    }
  });

  // ノードが空ならリンクもなくシミュレーションだけ返す
  if (nodes.length === 0) {
    return {
      nodes: [],
      links: [],
    };
  }

  //============= 類似度行列を計算 =============//
  const similarityMatrix: MatrixType[][] = [];
  for (let i = 0; i < nodes.length; i++) {
    similarityMatrix[i] = [];
    for (let j = 0; j < nodes.length; j++) {
      if (i === j || !nodes[i].similarGames?.includes(nodes[j].steamGameId)) {
        // 自分自身 or similarGamesに含まれていない場合は -2 で打ち切り
        similarityMatrix[i][j] = {
          similarity: -2,
          elementScores: emptyElementScores,
        };
        continue;
      }
      // cosineSimilarity
      const similarityObject = cosineSimilarityWithDetails(
        nodes[i].featureVector as number[],
        nodes[j].featureVector as number[],
        WEIGHT_TAG_LIST
      );

      // -2 のままなら代わりに Jaccard を計算して補完する
      if (similarityObject.similarity === -2) {
        const setA = new Set(nodes[i].tags ?? []);
        const setB = new Set(nodes[j].tags ?? []);
        similarityObject.similarity = jaccardSimilarity(setA, setB);
        similarityObject.elementScores = emptyElementScores;
      }

      similarityMatrix[i][j] = similarityObject;
    }
  }

  //============= リンクを構築 =============//
  const links: LinkType[] = [];
  const connectionCounts = new Map<number, number>(); // 各ノードの接続数を記録
  const usedConnections = new Set<string>(); // 重複接続を防ぐためのキー

  nodes.forEach((sourceNode) => {
    const sourceIndex = sourceNode.index!;
    // 対象ノードとの類似度を降順にソート
    const sortedSimilarities = similarityMatrix[sourceIndex]
      .map((simObj, targetIndex) => ({ simObj, targetIndex }))
      .filter((d) => d.targetIndex !== sourceIndex)
      .sort((a, b) => b.simObj.similarity - a.simObj.similarity);

    let addedLinks = 0; // k本まで追加
    for (const { simObj, targetIndex } of sortedSimilarities) {
      if (addedLinks >= k || simObj.similarity === -2) break;

      // すでに接続済みならスキップ
      const linkKey = `${Math.min(sourceIndex, targetIndex)}-${Math.max(
        sourceIndex,
        targetIndex
      )}`;
      if (usedConnections.has(linkKey)) continue;

      // どちらかが k本以上接続していたらスキップ
      const sourceConnections = connectionCounts.get(sourceIndex) || 0;
      const targetConnections = connectionCounts.get(targetIndex) || 0;
      if (sourceConnections >= k || targetConnections >= k) continue;

      // リンク生成
      links.push({
        source: nodes[sourceIndex],
        target: nodes[targetIndex],
        similarity: simObj.similarity,
        elementScores: simObj.elementScores,
      });
      usedConnections.add(linkKey);

      // 接続数を更新
      connectionCounts.set(sourceIndex, sourceConnections + 1);
      connectionCounts.set(targetIndex, targetConnections + 1);

      addedLinks++;
    }
  });

  //============= ノードのサイズスケーリング =============//
  const sizeScale = d3
    .scaleSqrt()
    .domain(d3.extent(nodes, (d) => d.activeUsers) as [number, number])
    .range([1, 6]);

  nodes.forEach((node) => {
    node.circleScale = sizeScale(node.activeUsers ?? 0);
  });

  //============= シミュレーションの設定 =============//
  const baseDistance = 200;
  const similarityFactor = 600;
  const minDistance = 10;

  const simulation = d3
    .forceSimulation<NodeType>(nodes)
    // 反発力
    .force("charge", d3.forceManyBody<NodeType>().strength(-800))
    // 画面中心への引き寄せ（必要に応じて強度を下げる/上げる）
    .force("center", d3.forceCenter(0, 0).strength(0.01))
    // ノード同士の衝突判定（重なり防止）
    .force(
      "collide",
      d3
        .forceCollide<NodeType>()
        .radius((d) => (d.circleScale ?? 1) * (CIRCLE_SIZE + 15))
        .iterations(3)
    )
    // リンクの距離
    .force(
      "link",
      d3
        .forceLink<NodeType, LinkType>(links)
        .id((d) => d.index!.toString())
        .distance((link) => {
          const source = link.source as NodeType;
          const target = link.target as NodeType;
          const similarity =
            similarityMatrix[source.index!][target.index!].similarity || 0;

          let distance = baseDistance - similarity * similarityFactor;
          distance = Math.max(distance, minDistance);
          return distance;
        })
        .strength(1)
    )
    // ラジアル方向に外側へ配置しやすくする力 (一例)
    .force("radial", d3.forceRadial(1200).strength(0.1))
    // クラスター的なまとまり感を強める力 (任意)
    .force(
      "cluster",
      d3
        .forceManyBody<NodeType>()
        .strength((node) => -25 * (node.circleScale ?? 1))
    );

  // ここでシミュレーションを停止せずに返すことで、
  // フロントエンド側で on("tick", ...) を使ったアニメーションを実装可能
  // simulation.stop() を呼ぶと初期位置が確定されるため注意

  while (simulation.alpha() > 0.01) {
    simulation.tick();
  }
  simulation.stop();

  //============= 類似度の正規化 =============//
  // リンクごとの similarity を 0~99 に丸める（例）
  const similarityScale = d3
    .scaleLinear()
    .domain(d3.extent(links, (link) => link.similarity) as [number, number])
    .range([0, 99]);

  links.forEach((link) => {
    if (typeof link.similarity === "number") {
      link.similarity = Math.round(similarityScale(link.similarity));
    }
  });

  // ネットワークを返す
  return {
    nodes,
    links,
  };
}
