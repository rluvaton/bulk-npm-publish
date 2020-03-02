import * as fs from 'fs';
import {PathLike, WriteFileOptions} from 'fs';


/**
 * @see fs.writeFile
 * @link fs#writeFile
 */
const writeFile = (path: PathLike | number, data: any, options?: WriteFileOptions): Promise<void> => {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, data, options, (err) => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
};

const fileWriter = (filePath: string, data: any): Promise<any> => {
  return writeFile(filePath, data);
};

export default fileWriter;
