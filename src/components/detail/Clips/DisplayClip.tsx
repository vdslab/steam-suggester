'use client'
import { useState } from "react";
import Image from "next/image";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { TwitchClipType } from "@/types/api/getTwitchClipType";

type DisplayClipProps = TwitchClipType & {
  nextSlide: () => void;
  prevSlide: () => void;
  isFirst: boolean;
  isLast: boolean;
};

const DisplayClip = (props: DisplayClipProps) => {
  const { url, embedUrl, image, title, nextSlide, prevSlide, isFirst, isLast } = props;
  const [showModal, setShowModal] = useState(false);

  const onHandleOpen = () => setShowModal(true);
  const onHandleClose = () => setShowModal(false);

  return (
    <div>
      <div className="relative flex flex-col px-10 cursor-pointer" onClick={onHandleOpen}>
        <Image 
          width={1000} 
          height={0} 
          src={image} 
          alt={title} 
          priority 
          className="mx-auto h-auto mt-5"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <PlayArrowIcon className="text-white" style={{ fontSize: 64 }} />
        </div>
      </div>

      {showModal && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50"
          onClick={onHandleClose}
        >
          <div 
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            onClick={(e) => e.stopPropagation()}
          >
            <CloseIcon
              className="absolute"
              sx={{ fontSize: 48, color: 'white', cursor: 'pointer', top: -50, right: -10 }}
              onClick={onHandleClose}
            />
            <iframe
              src={`${embedUrl}&parent=${process.env.NEXT_PUBLIC_DOMAIN}`}
              width='800'
              height='600'
              allowFullScreen
            />
            {/* Next & Prev ボタンをモーダル内に追加 */}
            <button
              onClick={prevSlide}
              className={`absolute -left-20 top-1/2 transform -translate-y-1/2 z-10 p-2 ${
                isFirst ? 'opacity-20 cursor-not-allowed' : 'opacity-100'
              }`}
              disabled={isFirst}
            >
              <ArrowBackIosNewIcon sx={{ fill: "white", fontSize: 48 }} />
            </button>

            <button
              onClick={nextSlide}
              className={`absolute -right-20 top-1/2 transform -translate-y-1/2 z-10 p-2 ${
                isLast ? 'opacity-20 cursor-not-allowed' : 'opacity-100'
              }`}
              disabled={isLast}
            >
              <ArrowForwardIosIcon sx={{ fill: "white", fontSize: 48 }} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisplayClip;
