import * as fs from 'fs';
import {promisify} from 'util';

/**
 * @see fs.writeFile
 * @link fs#writeFile
 */
const writeFile = promisify(fs.writeFile);

const fileWriter = (filePath: string, data: any): Promise<any> => {
  return writeFile(filePath, data);
};

export default fileWriter;
