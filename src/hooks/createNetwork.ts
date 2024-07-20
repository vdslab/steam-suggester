import * as d3 from 'd3';
import { gameDetailType } from "@/types/api/gameDetailsType";
import { steamGameGenreType, steamGamePlatformType } from '@/types/api/steamDataType';
import { getFilterData } from './indexedDB';
import { DEFAULT_FILTER } from '@/constants/DEFAULT_FILTER';

type Node = {
  circleScale?: number,
  gameData: GameData,
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

type Filter = {
  Categories: { [key: number]: boolean },
  Price: { [key: number]: boolean },
  Platforms: { [key: number]: boolean },
  Playtime: { [key: number]: boolean },
}

type GameData = {
  genres : steamGameGenreType[],
  price: number,
  isSinglePlayer: boolean,
  isMultiPlayer: boolean,
  platforms: steamGamePlatformType,
}



const countMatchingGenres = (filter: Filter, data: GameData) => {
  let matchingCount = 0;
  const userGenreIDs = Object.keys(filter.Categories).filter(id => filter.Categories[Number(id)]);
  data.genres.forEach((gameGenre: { id: string; }) => {
    if (userGenreIDs.includes(gameGenre.id)) {
      matchingCount++;
    }
  });
  return matchingCount;
};

const countMatchMode = (filter: Filter, data: GameData) => {
  let matchCount = 0;

  if (filter.Categories[1] === data.isMultiPlayer) 
    matchCount++;
  if (!filter.Categories[1] === data.isSinglePlayer)
    matchCount++;

  return matchCount;
};

const calculateMatchPercentage = (overview: number, userSelected: number) => {
  const diff = Math.abs(overview - userSelected);
  const matchPercentage = Math.round(Math.max(0, 100 - (diff / userSelected) * 100));
  return matchPercentage;
};

const calculateUserSelectedPrice = (filter: Filter) => {
  let price = 0;
  Object.keys(filter.Price).forEach((key, index) => {
    if (filter.Price[Number(key)]) {
      price = index === 0 ? 0 : (index + 1) * 1000;
    }
  });
  return price;
};

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

  const priceWeight = Math.abs(game1.price - game2.price);
  // const platformsWeight = game1.platforms === game2.platforms ? 1 : 0;
  // const playtimeWeight = Math.abs(game1.playtime - game2.playtime);
  const totalWeight = genresWeight * 10 + (1 / priceWeight) * 100;
  return 1 / genresWeight;
};

const createNetwork = async () => {
  const k = 4;

  const res = await fetch(`${process.env.NEXT_PUBLIC_CURRENT_URL}/api/network/getMatchGames`);
  const data:gameDetailType[] = await res.json();

  const d = await getFilterData('unique_id');
  const filter: any = d ? d : DEFAULT_FILTER;

  const links: any = [];
  const similarGames: any = {};
  const ngIndex = [];

  const matchScale = d3.scaleLinear()
                      .domain([0, 100])
                      .range([1, 4])

  const nodes: Node[] = Object.values(data).filter((item: any) => {
    if(!item.gameData.genres.find((value:any) => filter["Categories"][value.id])) return false;
    /* const priceId = item.gameData.price < 1000 ? 1 : Math.floor(item.gameData.price / 1000) + 1; */
    /* if(!filter["Price"][priceId]) return false; */
    if(!((item.gameData.isSinglePlayer && filter["Platforms"]["1"]) || (item.gameData.isMultiPlayer && filter["Platforms"]["2"]))) return false;
    if(!((item.gameData.platforms["windows"] && filter["device"]["1"]) || (item.gameData.platforms["mac"] && filter["device"]["2"]))) return false;
    /* const playtimeId = item.playtime < 100 ? 1 : Math.floor(item.playtime / 100) + 1;
    if(!filter["Playtime"][playtimeId]) return false; */
    
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
    // 一致度を計算（ジャンル）
    const genreMatchCount = countMatchingGenres(filter, node.gameData);
    const genreMatch = calculateMatchPercentage(genreMatchCount, node.gameData.genres.length);

    // 一致度を計算(価格)
    const priceMatch = calculateMatchPercentage(node.gameData.price, calculateUserSelectedPrice(filter));

    // 一致度を計算(ゲームモード)
    const modeMatchCount = countMatchMode(filter, node.gameData);
    const modeMatch = calculateMatchPercentage(2, modeMatchCount);

    // 一致度を計算(全体)
    const overallMatch = Math.round((genreMatch + priceMatch + modeMatch) / 3);

    node.circleScale = matchScale(overallMatch);
  });

  return {nodes, links, similarGames};
};

export default createNetwork;