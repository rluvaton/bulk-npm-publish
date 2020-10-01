import * as fs from 'fs';
import {Stats} from 'fs';

export const getPathType = (path: string): Promise<Stats> => new Promise((resolve, reject) =>
  fs.lstat(path, (err, stats) => err ? reject(err) : resolve(stats))
);

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
