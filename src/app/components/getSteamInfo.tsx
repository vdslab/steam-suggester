import React, { useState, useEffect } from "react";

const SteamGameInfo = ({ appId }) => {
    const [gameInfo, setGameInfo] = useState(null);
    const [gameReviews, setGameReviews] = useState(null);
    useEffect(() => {
      console.log(gameReviews);
    }, [gameReviews]);
    useEffect(() => {
      const fetchGameInfo = async () => {
        try {
          const response = await fetch(
            `steam/api/appdetails?appids=${appId}&cc=jp`
          );
          const data = await response.json();
          setGameInfo(data[appId].data);
        } catch (error) {
          console.error("Error fetching game info:", error);
        }
        try {
          const response = await fetch(
            `steam/appreviews/${appId}?json=1&filter=recent&num_per_page=100`
          );
          const data = await response.json();
          setGameReviews(data);
        } catch (error) {
          console.error("Error fetching game reviews:", error);
        }
      };
  
      fetchGameInfo();
    }, [appId]);
  
    if (!gameInfo) {
      return <div>Loading...</div>;
    }
  
    return (
      <div>
        <p>名前：{gameInfo.name}</p>
        <p>説明文：{gameInfo.short_description}</p>
        <p>
          ジャンル：
          {gameInfo.genres.map((genre) => (
            <li key={genre.id}>{genre.description}</li>
          ))}
        </p>
        <p>ソロorマルチ：{gameInfo.categories[0].description}</p>
        {/* <p>価格{gameInfo.price_overview.initial}</p> */}
        <p>PCスペック{gameInfo.pc_requirements.minimum}</p>
        <p>
          <a href="https://store.steampowered.com/app/${gameInfo.steam_appid}">
            link
          </a>
        </p>
        <img src={gameInfo.header_image} alt="Game Header" />
      </div>
    );
  };