import * as d3 from 'd3';
import { getFilterData } from './indexedDB';
import { DEFAULT_FILTER } from '@/constants/DEFAULT_FILTER';
import { Filter } from '@/types/api/FilterType';
import { ISR_FETCH_INTERVAL } from '@/constants/DetailsConstants';
import { calcAllMatchPercentage } from '@/components/common/CalcMatch';
import { NodeType } from '@/types/NetworkType';

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

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_CURRENT_URL}/api/network/getMatchGames`,
    {next: { revalidate: ISR_FETCH_INTERVAL }}
  );
  if(!res) {
    return {};
  }
  const data: NodeType[] = await res.json();

  const d = await getFilterData();
  const filter: Filter = d ? d : DEFAULT_FILTER;

  const links: any = [];
  const similarGames: any = {};
  const ngIndex = [];

  const matchScale = d3.scaleLinear()
                      .domain([0, 100])
                      .range([1, 3])

  const nodes: NodeType[] = Object.values(data).filter((item: any) => {
    if(!item.gameData.genres.find((value:any) => filter["Categories"][value.id])) return false;
    if(!(filter.Price.startPrice <= item.gameData.price && item.gameData.price <= filter.Price.endPrice)) return false;
    if(!((item.gameData.isSinglePlayer && filter.Mode.isSinglePlayer) || (item.gameData.isMultiPlayer && filter.Mode.isMultiPlayer))) return false;
    if(!((item.gameData.device.windows && filter.Device.windows) || (item.gameData.device.mac && filter.Device.mac))) return false;
   
    return true;
  }).map((node: NodeType, index: number) => {
    return {
    id: index,
    title: node.title,
    imgURL: node.imgURL,
    gameData: node.gameData,
    steamGameId: node.steamGameId,
    twitchGameId: node.twitchGameId,
    totalViews: node.totalViews,
  }});

  for (let i = 0; i < nodes.length; i++) {
    const array = nodes
      .filter((_,index) => i !== index)
      .map((node, index) => {
        return {
          index,
          weight: calcCommonGenres(nodes[i].gameData, node.gameData)
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
    const overallMatchPercent = calcAllMatchPercentage(filter, node.gameData);
    node.circleScale = matchScale(overallMatchPercent);
  });

  const simulation = d3
    .forceSimulation(nodes)
    .force(
      "link",
      d3
        .forceLink(links)
        .id((d:any) => d.id)
        .distance((item: any) => {
          return calcCommonGenres(item.source.gameData, item.target.gameData);
        })
    )
    .force("charge", d3.forceManyBody().strength(-1000))
    .force("center", d3.forceCenter(window.innerWidth / 2, window.innerHeight / 2))
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