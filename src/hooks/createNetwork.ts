import * as d3 from 'd3';
import { gameDetailType } from "@/types/api/gameDetailsType";
import { getFilterData } from './indexedDB';
import { DEFAULT_FILTER } from '@/constants/DEFAULT_FILTER';

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

  const nodes = Object.values(data).filter((item: any) => {
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
    total_views: node.total_views,
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

  links.forEach((link: any) => {
    const sourceGame = link.source;
    const targetGame = link.target;

    if(sourceGame === targetGame) return ;

    if(similarGames[sourceGame.steamGameId]) {
      if(!similarGames[sourceGame.steamGameId].includes({steamGameId: targetGame.steamGameId, twitchGameId: targetGame.twitchGameId})) {
        similarGames[sourceGame.steamGameId].push({steamGameId: targetGame.steamGameId, twitchGameId: targetGame.twitchGameId});
      }
    } else {
      similarGames[sourceGame.steamGameId] = [{steamGameId: targetGame.steamGameId, twitchGameId: targetGame.twitchGameId}];
    }

    if(similarGames[targetGame.steamGameId]) {
      if(!similarGames[targetGame.steamGameId].includes({steamGameId: sourceGame.steamGameId, twitchGameId: sourceGame.twitchGameId})) {
        similarGames[targetGame.steamGameId].push({steamGameId: sourceGame.steamGameId, twitchGameId: sourceGame.twitchGameId});
      }
    } else {
      similarGames[targetGame.steamGameId] = [{steamGameId: sourceGame.steamGameId, twitchGameId: sourceGame.twitchGameId}];
    }
  });

  return {nodes, links, similarGames};
};

export default createNetwork;