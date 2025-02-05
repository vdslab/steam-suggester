export const startsWith = (str: string | null, prefix: string) => {
  if (str === null || str === undefined) {
    return false;
  }
  return str?.startsWith(prefix);
};

export const startsWithPanelList = (str: string | null) => {
  if (str === null || str === undefined) {
    return false;
  }
  return str && ["streamer", "highlight", "steamList", "ranking", "similarity", "filter"].includes(str);
}
