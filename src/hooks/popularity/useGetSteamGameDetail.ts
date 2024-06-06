import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const useGetSteamGameDetail = (gameId: number) => {
  const { data, error } = useSWR(`/api/popularity/getSteamGameDetail`, fetcher);
  return {
    data,
    error,
    isLoading: !data && !error,
  };
};

export default useGetSteamGameDetail;
