import * as d3 from 'd3';
import { getFilterData } from './indexedDB';
import { DEFAULT_FILTER } from '@/constants/DEFAULT_FILTER';
import { Filter } from '@/types/api/FilterType';
import { SteamDetailsDataType, SteamDeviceType, SteamGenreType } from '@/types/api/getSteamDetailType';
import { ISR_FETCH_INTERVAL } from '@/constants/DetailsConstants';
import { calcAllMatchPercentage } from '@/components/common/CalcMatch';

type Node = {
  circleScale?: number,
  gameData: SteamDetailsDataType,
  id: number,
  imgURL: string,
  index?: number,
  steamGameId: string,
  title: string,
  totalViews: number,
  twitchGameId: string,
  vx?: number,
  vy?: number,
  x?: number,
  y?: number,
}


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
  const data:SteamDetailsDataType[] = await res.json();

  const d = await getFilterData('unique_id');
  const filter: Filter = d ? d : DEFAULT_FILTER;

  const links: any = [];
  const similarGames: any = {};
  const ngIndex = [];

  const matchScale = d3.scaleLinear()
                      .domain([0, 100])
                      .range([1, 3])

  const nodes: Node[] = Object.values(data).filter((item: any) => {
    if(!item.gameData.genres.find((value:any) => filter["Categories"][value.id])) return false;
    if(!(filter.Price.startPrice <= item.gameData.price && item.gameData.price <= filter.Price.endPrice)) return false;
    if(!((item.gameData.isSinglePlayer && filter.Mode.isSinglePlayer) || (item.gameData.isMultiPlayer && filter.Mode.isMultiPlayer))) return false;
    if(!((item.gameData.device.windows && filter.Device.windows) || (item.gameData.device.mac && filter.Device.mac))) return false;
   
    return true;
  }).map((node: any, index) => ({
    id: index,
    title: node.title,
    imgURL: node.imgURL,
    gameData: node.gameData,
    steamGameId: node.steamGameId,
    twitchGameId: node.twitchGameId,
    totalViews: node.totalViews,
  }));

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
    array.sort((a, b) => a.weight - b.weight);

    const newArray = array.map((item) => item.index);

    let count = 0;
    newArray.forEach((index) => {
      const isSourceOk =
        links.filter((item:any) => item.target === i || item.source === i)
          .length < k;
      const isTargetOk =
        links.filter((item:any) => item.target === index || item.source === index)
          .length < k;
      if (count < k && isSourceOk && isTargetOk) {
        if (i !== index) {
          links.push({ source: i, target: index });
          count++;
        }
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

  simulation.tick(300).stop()

  nodes.forEach((node: any) => {
    similarGames[node.steamGameId] = [];
  })

  links.forEach((link: any) => {
    const sourceGame = link.source;
    const targetGame = link.target;

    const isSourceGameIncluded = similarGames[sourceGame.steamGameId].some((game:any) => 
      game.steamGameId === targetGame.steamGameId && targetGame.twitchGameId === targetGame.twitchGameId
    );
    if(!isSourceGameIncluded) {
      similarGames[sourceGame.steamGameId].push({steamGameId: targetGame.steamGameId, twitchGameId: targetGame.twitchGameId});
    }
   
    const isTargetGameIncluded = similarGames[targetGame.steamGameId].some((game:any) => 
      game.steamGameId === sourceGame.steamGameId && game.twitchGameId === sourceGame.twitchGameId
    );
    if(!isTargetGameIncluded) {
      similarGames[targetGame.steamGameId].push({steamGameId: sourceGame.steamGameId, twitchGameId: sourceGame.twitchGameId});
    }

  });

  nodes.forEach((node: Node) => {
    // 一致度を計算(全体)
    const overallMatchPercent = calcAllMatchPercentage(filter, node.gameData);
    node.circleScale = matchScale(overallMatchPercent);
  });

  return {nodes, links, similarGames};
};

export default createNetwork;