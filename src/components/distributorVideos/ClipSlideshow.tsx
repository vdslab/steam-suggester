'use client'

import { useState, useCallback, useEffect } from "react";
import DisplayClip from "./DisplayClip";
import { TwitchClipType } from "@/types/api/DetailsTypes";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

type Props = {
  data: TwitchClipType[];
};

const ClipSlideshow = (props: Props) => {
  const { data } = props;

  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % data.length);
  }, [data.length]);

  const prevSlide = () => {
    setCurrentSlide((prevSlide) =>
      prevSlide === 0 ? data.length - 1 : prevSlide - 1
    );
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 10000);
    return () => clearInterval(timer);
  }, [data.length, nextSlide]);

  return (
    <div>
      <div className="relative flex items-center justify-center">
        <button
          onClick={prevSlide}
          className={`absolute left-0 z-10 ${currentSlide === 0 ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}`}
          disabled={currentSlide === 0}
        >
          <ArrowBackIosNewIcon sx={{ fill: "white" }} />
        </button>
        <DisplayClip {...data[currentSlide]} />
        <button
          onClick={nextSlide}
          className={`absolute right-0 z-10 ${currentSlide === data.length - 1 ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}`}
          disabled={currentSlide === data.length - 1}
        >
          <ArrowForwardIosIcon sx={{ fill: "white" }} />
        </button>
      </div>

      <a
        className="text-white w-64 mx-auto block text-center mt-2"
        href={data[currentSlide].url} target="_blank"
        rel="noopener noreferrer"
      >
        {data[currentSlide].title}
      </a>
    </div>
  );
};

export default ClipSlideshow;
