'use client';
import { useFilterData } from '@/hooks/useFilterData';
import StarIcon from '@mui/icons-material/Star';
import CircularProgress from '@mui/material/CircularProgress';

import React from "react";


const UserSelection = () => {

  const { filterData, error } = useFilterData();

  if (error) {
    return <div className="text-red-500 text-center mt-4">{error}</div>;
  }

  if (!filterData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress />
      </div>
    );
  }

  const { genres, priceRange, modes, devices, playtimes } = filterData;

  return (
    <div className="rounded-lg overflow-hidden border border-gray-400 bg-gray-700 p-4">
      <StarIcon className="flex-shrink-0 text-yellow-500 mb-2" />
      <span className="text-xl font-semibold text-white mb-4">あなたの選択</span>
      
      {/* ジャンル */}
      <div className="mb-2">
        <strong className="text-white">ジャンル:</strong>
        <div className="flex flex-wrap mt-2">
          {genres.map((genre, index) => (
            <span
              key={index}
              className="bg-blue-600 text-xs text-white px-2 py-1 rounded mr-2 mb-2 flex items-center"
            >
              {genre}
            </span>
          ))}
        </div>
      </div>
      
      {/* 価格範囲 */}
      <div className="mb-2">
        <strong className="text-white">価格範囲:</strong>
        <div className="flex flex-wrap mt-2">
          <span className="bg-orange-600 text-xs text-white px-2 py-1 rounded mr-2 mb-2 flex items-center">
            ¥{priceRange.startPrice} - ¥{priceRange.endPrice}
          </span>
        </div>
      </div>
      
      {/* プレイモード */}
      <div className="mb-2">
        <strong className="text-white">プレイモード:</strong>
        <div className="flex flex-wrap mt-2">
          {modes.map((mode, index) => (
            <span
              key={index}
              className="bg-purple-600 text-xs text-white px-2 py-1 rounded mr-2 mb-2 flex items-center"
            >
              {mode}
            </span>
          ))}
        </div>
      </div>
      
      {/* デバイス */}
      <div className="mb-2">
        <strong className="text-white">デバイス:</strong>
        <div className="flex flex-wrap mt-2">
          {devices.map((device, index) => (
            <span
              key={index}
              className="bg-yellow-600 text-xs text-white px-2 py-1 rounded mr-2 mb-2 flex items-center"
            >
              {device}
            </span>
          ))}
        </div>
      </div>
      
      {/* プレイ時間 */}
      {/* <div className="mb-2">
        <strong className="text-white">プレイ時間:</strong>
        <div className="flex flex-wrap mt-2">
          {playtimes.map((time, index) => (
            <span
              key={index}
              className="bg-red-600 text-xs text-white px-2 py-1 rounded mr-2 mb-2 flex items-center"
            >
              {time}
            </span>
          ))}
        </div>
      </div> */}
    </div>
  );
};

export default UserSelection;
