import * as d3 from 'd3';
import { getFilterData, getGameIdData } from './indexedDB';
import { DEFAULT_FILTER } from '@/constants/DEFAULT_FILTER';
import { Filter } from '@/types/api/FilterType';
import { ISR_FETCH_INTERVAL } from '@/constants/DetailsConstants';
import { calcAllMatchPercentage } from '@/components/common/CalcMatch';
import { NodeType } from '@/types/NetworkType';
import { SteamDetailsDataType } from '@/types/api/getSteamDetailType';

const calcCommonGenres = (game1:any, game2:any) => {
  let genresWeight = 1;

  game1.genres.forEach((item:any) =>
    game2.genres.forEach((i:any) => {
      if (i.id === item.id) {
        genresWeight++;
      }
    })
  );
  genresWeight *= 10;

  return 1 / genresWeight;
};

const createNetwork = async () => {
  const k = 4;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_CURRENT_URL}/api/network/getMatchGames`,
    {next: { revalidate: ISR_FETCH_INTERVAL }}
  );
  if(!response) {
    return {};
  }
  const data: SteamDetailsDataType[] = await response.json();

  const gameIds = await getGameIdData() ?? [];

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

  const filter: Filter = await getFilterData() ?? DEFAULT_FILTER;

  const links: any = [];
  const similarGames: any = {};
  const ngIndex = [];

  const matchScale = d3.scaleLinear()
                      .domain([0, 100])
                      .range([1, 3])

  const nodes: NodeType[] = data.filter((item: SteamDetailsDataType) => {
    if(!item.genres.find((value:any) => filter["Categories"][value.id])) return false;
    if(!(filter.Price.startPrice <= item.price && item.price <= filter.Price.endPrice)) return false;
    if(!((item.isSinglePlayer && filter.Mode.isSinglePlayer) || (item.isMultiPlayer && filter.Mode.isMultiPlayer))) return false;
    if(!((item.device.windows && filter.Device.windows) || (item.device.mac && filter.Device.mac))) return false;
    return true;
  });

  for (let i = 0; i < nodes.length; i++) {
    const array = nodes
      .filter((_,index) => i !== index)
      .map((node, index) => {
        return {
          index,
          weight: calcCommonGenres(nodes[i], node)
        };
      })
      .filter((e) => e);
    array.sort((a, b) => b.weight - a.weight);

    const newArray = array.map((item) => item.index);

    let count = 0;
    newArray.forEach((index) => {
      const isSourceOk =
        links.filter((item:any) => item.target === i || item.source === i)
          .length < k;
      const isTargetOk =
        links.filter((item:any) => item.target === index || item.source === index)
          .length < k;
      if (count < k && isSourceOk && isTargetOk && i !== index) {
        links.push({ source: i, target: index });
        count++;
        if (
          links.filter((item:any) => item.target === i || item.source === i)
            .length >= k
        ) {
          ngIndex.push(i);
        } else if (
          links.filter(
            (item:any) => item.target === index || item.source === index
          ).length >= k
        ) {
          ngIndex.push(index);
          count++;
        }
      }
    });
  }

  nodes.forEach((node: NodeType) => {
    // 一致度を計算(全体)
    const overallMatchPercent = calcAllMatchPercentage(filter, node);
    node.circleScale = matchScale(overallMatchPercent);
  });

  nodes.sort((node1: NodeType, node2: NodeType) => (node2?.circleScale ?? 0) - (node1?.circleScale ?? 0));

  const simulation = d3
    .forceSimulation(nodes)
    .force(
      "link",
      d3
        .forceLink(links)
        .id((d:any) => d.index)
        .distance((item: any) => {
          return calcCommonGenres(item.source, item.target);
        })
    )
    .force("charge", d3.forceManyBody().strength(-1000))
    .force("collide", d3.forceCollide().radius((d: any) => d.circleScale * 20)) // 衝突半径を設定

  simulation.tick(300).stop()

  nodes.forEach((node: any) => {
    similarGames[node.steamGameId] = [];
  })

  links.forEach((link: any) => {
    const sourceGame = link.source;
    const targetGame = link.target;
  
    const isSourceGameIncluded = similarGames[sourceGame.steamGameId].some((game: any) =>
      game.steamGameId === targetGame.steamGameId && game.twitchGameId === targetGame.twitchGameId
    );
    if (!isSourceGameIncluded) {
      similarGames[sourceGame.steamGameId].push({ steamGameId: targetGame.steamGameId, twitchGameId: targetGame.twitchGameId });
    }
  
    const isTargetGameIncluded = similarGames[targetGame.steamGameId].some((game: any) =>
      game.steamGameId === sourceGame.steamGameId && game.twitchGameId === sourceGame.twitchGameId
    );
    if (!isTargetGameIncluded) {
      similarGames[targetGame.steamGameId].push({ steamGameId: sourceGame.steamGameId, twitchGameId: sourceGame.twitchGameId });
    }
  });

  return {nodes, links, similarGames};
};

export default createNetwork;