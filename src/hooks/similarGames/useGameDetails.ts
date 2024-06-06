import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const useGameDetails = () => {
  const { data, error } = useSWR(`/api/similarGames/gameDetails`, fetcher);
  return {
    data,
    error,
    isLoading: !data && !error,
  };
};

export default useGameDetails;
