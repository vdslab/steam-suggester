'use client'
import { TwitchClips } from "@/types/distributorVideos/TwitchClips";
import { useState } from "react";
import Image from "next/image";

const DisplayClip = (props: TwitchClips) => {

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
      <div className="flex flex-col px-5 " onClick={onHandleOpen}>
        <Image width={1000} height={0} src={image} alt={title} priority className="mx-auto h-auto w-64" />
        <a
          className="text-white"
          href={url} target="_blank"
          rel="noopener noreferrer"
        >
          {title}
        </a>
      </div>
      {showModal && // 写真をクリックしたらモーダルが表示される
        <div
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50"
          onClick={onHandleClose}>
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            onClick={(e) => e.stopPropagation}>

            <iframe
              src={`${embedUrl}&parent=localhost`}
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
