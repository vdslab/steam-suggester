'use client';

import React from "react";
import { useFilterData } from '@/hooks/useFilterData';
import StarIcon from '@mui/icons-material/Star';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

const UserSelection = () => {
  const [open, setOpen] = React.useState(false);

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
      <div className=''>
        <StarIcon className="flex-shrink-0 text-yellow-500 mb-2" />
        <button
          onClick={() => setOpen(true)}
          className="text-xl font-semibold text-white"
        >
          あなたの選択を見る
        </button>
      </div>

      {/* Popup Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
        aria-labelledby="user-selection-dialog-title"
      >
        <DialogTitle id="user-selection-dialog-title" className="flex justify-between items-center">
          <span className="text-xl font-semibold">あなたの選択</span>
          <IconButton onClick={() => setOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {/* ジャンル */}
          <div className="mb-2">
            <strong>ジャンル:</strong>
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
            <strong>価格範囲:</strong>
            <div className="flex flex-wrap mt-2">
              <span className="bg-orange-600 text-xs text-white px-2 py-1 rounded mr-2 mb-2 flex items-center">
                ¥{priceRange.startPrice} - ¥{priceRange.endPrice}
              </span>
            </div>
          </div>

          {/* プレイモード */}
          <div className="mb-2">
            <strong>プレイモード:</strong>
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
            <strong>デバイス:</strong>
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
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserSelection;
