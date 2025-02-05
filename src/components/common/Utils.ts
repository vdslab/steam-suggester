export const startsWith = (str: string | null, prefix: string) => {
  if (str === null || str === undefined) {
    return false;
  }
  return str?.startsWith(prefix);
};

export const startsWithArray = (str: string | null, prefixArray: string[]) => {
  if (str === null || str === undefined) {
    return false;
  }
  return prefixArray.some((prefix) => str.startsWith(prefix));
}
