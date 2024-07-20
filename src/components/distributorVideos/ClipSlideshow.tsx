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

  // Optional: Automatically go to the next slide every 5 seconds
  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [data.length, nextSlide]);


  return (
    <div className="relative flex items-center justify-center">
      <button onClick={prevSlide} className="absolute left-0 z-10 fill-white">
        <ArrowBackIosNewIcon sx={{ fill:"white" }}/>
      </button>
      <DisplayClip {...data[currentSlide]} />
      <button onClick={nextSlide} className="absolute right-0 z-10 fill-white">
        <ArrowForwardIosIcon sx={{ fill:"white" }}/>
      </button>
    </div>
  )
}

export default ClipSlideshow