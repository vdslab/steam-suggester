import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const useConvertSteamGameIdListFromGameName = () => {
  const { data, error } = useSWR(`/api/useConvertSteamGameIdListFromGameName`, fetcher);
  return {
    data,
    error,
    isLoading: !data && !error,
  };
};

export default useConvertSteamGameIdListFromGameName;
