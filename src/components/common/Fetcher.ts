export const fetcher = async (key: string) => {
  return await fetch(key).then((res) => res.json());
}