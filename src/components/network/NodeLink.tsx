"use client";

import React, { useState, useEffect, useRef } from "react";
import * as d3 from 'd3';
import testData from './testData.json';
import Icon from "./Icon";

const ZoomableSVG = (props:any) => {
  const { children } = props;

  const svgRef = useRef<SVGSVGElement>(null);
  const [k, setK] = useState(1);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);

  useEffect(() => {
    const zoom = d3.zoom().on("zoom", (event:any) => {
      const { x, y, k } = event.transform;
      setX(x);
      setY(y);
      setK(k);
    });
    d3.select(svgRef.current).call(zoom);
  }, []);
  return (
    <svg ref={svgRef} width={window.innerWidth} height={window.innerHeight}>
      <g transform={`translate(${x + 300},${y + 200})scale(${k - 0.5})`}>
        {children}
      </g>
    </svg>
  );
};

const NodeLink = (props:any) => {
  const { filter, data } = props;
  const k = 3;

  const [selectGameIdx, setSelectGameIdx] = useState(0);

  const [isLoading, setIsLoading] = useState(true);

  const [newLinks, setNewLinks] = useState([]);
  const [newNode, setNewNode] = useState([]);

  const calcCommonGenres = (game1:any, game2:any) => {
    let genresWeight = 0;
    /* if(game1.title === game2.title) {
      return 1;
    } */

    game1.genres.forEach((item:any) =>
      game2.genres.forEach((i:any) => {
        if (i.id === item.id) {
          genresWeight++;
        }
      })
    );

    const priceWeight = Math.abs(game1.price - game2.price);
    // const platformsWeight = game1.platforms === game2.platforms ? 1 : 0;
    // const playtimeWeight = Math.abs(game1.playtime - game2.playtime);
    const totalWeight = genresWeight * 10 + (1 / priceWeight) * 100;
    return 10;
  };

  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const links:any = [];
    const ngIndex = [];

    const nodes = Object.values(data).filter((item: any) => {
      /* if(!item.gameData.genres.find((value:any) => filter["Categories"][value.id])) return false;
      const priceId = item.gameData.price < 1000 ? 1 : Math.floor(item.gameData.price / 1000) + 1;
      if(!filter["Price"][priceId]) return false;
      const platformsId = item.gameData.isSinglePlayer ? 1 : 2;
      if(!filter["Platforms"][platformsId]) return false; */
      /* const playtimeId = item.playtime < 100 ? 1 : Math.floor(item.playtime / 100) + 1;
      if(!filter["Playtime"][playtimeId]) return false; */
      
      return true;
    }).map((node:any, index) => ({
      id: index,
      title: node.title,
      imgURL: node.imgURL,
      gameData: node.gameData,
      steamGameId: node.steamGameId
      /* playtime: node.playtime, */
    }));


    for (let i = 0; i < nodes.length; i++) {
      const array = nodes
        .map((node, index) => {
          return {
            index,
            weight: Math.random() * 10
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
          /* .strength((item: any) => {
            return calcCommonGenres(item.source, item.target);
          }) */
      )
      .force("charge", d3.forceManyBody().strength(-1000))
      .force("center", d3.forceCenter(width / 3, height / 2));

    let tickCount = 0;

    simulation.on("tick", () => {
      tickCount++;
      if (tickCount >= 300) {
        simulation.stop();
        const newnode:any = nodes.map((node:any) => {
          return {
            x: node.x,
            y: node.y,
            index: node.index,
            title: node.title,
            imgURL: node.imgURL,
            gameData: node.gameData,
            steamGameId: node.steamGameId
          };
        })
        setNewNode(newnode);

        setNewLinks(
          links.map((link:any) => {
            return {
              ...link,
              color: "white",
              width: 1,
            }
          })
        );

        setIsLoading(false);
      }
    });
  }, [filter]);

  return (
    <div>
      {!isLoading ? <ZoomableSVG>
      {newLinks.length !== 0 &&
        newLinks.map((link:any, i) => (
          <line
            key={i}
            className="link"
            x1={link.source.x}
            y1={link.source.y}
            x2={link.target.x}
            y2={link.target.y}
            style={{ stroke: link.color, strokeWidth: link.width }}
          />
        ))}
      {newNode.length !== 0 &&
        newNode.map((node:any, i) => {
          return (
            <g transform={`translate(${node.x},${node.y})`} key={i}>
              <Icon
                title={node.title}
                imgURL={node.imgURL}
                index={node.index}
                steamGameId={node.steamGameId}
              ></Icon>
            </g>
          );
        })}
    </ZoomableSVG> : <div>Loading...</div>
    }
    </div>
    
    
  );
};

export default NodeLink;