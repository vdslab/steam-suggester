'use client'
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const useTwitchClips = () => {
  const { data, error } = useSWR(`/api/distributorVideos/getTwitchClips`, fetcher);
  return {
    data,
    error,
    isLoading: !data && !error,
  };
};

export default useTwitchClips;
