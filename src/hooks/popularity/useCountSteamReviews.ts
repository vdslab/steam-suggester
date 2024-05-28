import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const useCountSteamReview = (gameId: number) => {
  const { data, error } = useSWR(`/api/popularity/countSteamReviews`, fetcher);
  return {
    data,
    error,
    isLoading: !data && !error,
  };
};

export default useCountSteamReview;
