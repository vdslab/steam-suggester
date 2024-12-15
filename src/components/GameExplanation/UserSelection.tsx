/* components/UserSelection/UserSelection.tsx */
'use client';

import React, { useState, useEffect } from 'react';
import Chip from '@mui/material/Chip';
import { getFilterData } from '@/hooks/indexedDB';
import { CircularProgress } from '@mui/material';

type UserSelectionProps = {
  genres: string[];
  priceRange: { startPrice: number; endPrice: number };
  modes: string[];
  devices: string[];
  playtimes: string[];
};

const UserSelection: React.FC<UserSelectionProps> = ({
  genres,
  priceRange,
  modes,
  devices,
  playtimes,
}) => {
  return (
    <div className="p-4 bg-gray-700 rounded">
      <h3 className="text-xl font-semibold text-white mb-2">あなたの選択</h3>
      <div className="space-y-2">
        {/* ジャンル */}
        {genres.length > 0 && (
          <div>
            <span className="text-sm text-gray-300 font-medium">ジャンル:</span>
            <div className="flex flex-wrap mt-1">
              {genres.map((genre, index) => (
                <Chip
                  key={index}
                  label={genre}
                  color="primary"
                  size="small"
                  className="mr-2 mb-2"
                />
              ))}
            </div>
          </div>
        )}

        {/* 価格範囲 */}
        <div>
          <span className="text-sm text-gray-300 font-medium">価格範囲:</span>
          <div className="mt-1">
            <Chip
              label={`¥${priceRange.startPrice} - ¥${priceRange.endPrice}`}
              color="secondary"
              size="small"
            />
          </div>
        </div>

        {/* モード */}
        {modes.length > 0 && (
          <div>
            <span className="text-sm text-gray-300 font-medium">モード:</span>
            <div className="flex flex-wrap mt-1">
              {modes.map((mode, index) => (
                <Chip
                  key={index}
                  label={mode}
                  color="success"
                  size="small"
                  className="mr-2 mb-2"
                />
              ))}
            </div>
          </div>
        )}

        {/* デバイス */}
        {devices.length > 0 && (
          <div>
            <span className="text-sm text-gray-300 font-medium">デバイス:</span>
            <div className="flex flex-wrap mt-1">
              {devices.map((device, index) => (
                <Chip
                  key={index}
                  label={device}
                  color="default"
                  size="small"
                  className="mr-2 mb-2"
                />
              ))}
            </div>
          </div>
        )}

        {/* プレイ時間 */}
        {playtimes.length > 0 && (
          <div>
            <span className="text-sm text-gray-300 font-medium">プレイ時間:</span>
            <div className="flex flex-wrap mt-1">
              {playtimes.map((time, index) => (
                <Chip
                  key={index}
                  label={`${time} 時間`}
                  color="warning"
                  size="small"
                  className="mr-2 mb-2"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSelection;
