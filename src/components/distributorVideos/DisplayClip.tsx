'use client'
import { useState } from "react";
import Image from "next/image";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CloseIcon from '@mui/icons-material/Close';
import { TwitchClipType } from "@/types/api/getTwitchClipType";

const DisplayClip = (props: TwitchClipType) => {

  const { url, embedUrl, image, title } = props;

  const [showModal, setShowModal] = useState(false);

  const onHandleOpen = () => {
    setShowModal(true);
  }

  const onHandleClose = () => {
    setShowModal(false);
  }

  return (
    <div>
      <div className="relative flex flex-col px-5 cursor-pointer" onClick={onHandleOpen}>
        <Image width={1000} height={0} src={image} alt={title} priority className="mx-auto h-auto w-82 mt-5" />
        <div className="absolute inset-0 flex items-center justify-center">
          <PlayArrowIcon className="text-white" style={{ fontSize: 64 }} />
        </div>
      </div>
      {showModal && // 写真をクリックしたらモーダルが表示される
        <div
          className="fixed top-0 left-0 w-full h-full  bg-opacity-50 z-50"
          onClick={onHandleClose}>

          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            onClick={(e) => e.stopPropagation()}>
            <CloseIcon
              className="absolute"
              sx={{ fontSize: 48, color: 'white', cursor: 'pointer', top: -50, right:-10}}
              onClick={onHandleClose}
            />
            <iframe
              src={`${embedUrl}&parent=${process.env.NEXT_PUBLIC_DOMAIN}`}
              width='800'
              height='600'
              allowFullScreen
            />
          </div>
        </div>
      }
    </div>
  );
};

export default DisplayClip;
