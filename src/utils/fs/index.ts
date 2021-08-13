import { Stats } from 'fs';
import fsPromises from 'fs/promises';

export const getPathType = (path: string): Promise<Stats> => fsPromises.lstat(path);

export const isDirectoryExists = async (path?: string) => {
  if (!path) {
    return false;
  }

  let stats: Stats;
  try {
    stats = await getPathType(path);
  } catch (e) {
    return false;
  }

  return stats.isDirectory();
};
