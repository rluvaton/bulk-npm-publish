import {UserOptions} from './user-options';
import {isDirectoryExists} from '../fs-utils';
import {dirname} from 'path';

export const validateUserOptions = async (user: Partial<UserOptions>): Promise<boolean> => {
  return (await Promise.all([
    validateStorage(user.storagePath),
    validateDestPublishScriptFilePath(user.destPublishScriptFilePath)
  ])).every((isValid) => isValid);
};

/**
 * Validate that storage path is a directory and exists.
 * @param path Verdaccio storage path.
 * @return If the path valid.
 */
export const validateStorage = (path?: UserOptions['storagePath']): Promise<boolean> => isDirectoryExists(path);

/**
 * Validate that the parent folder of the file path exists
 * @param path file path
 * @return If the parent directory exists.
 */
export const validateDestPublishScriptFilePath = (path?: UserOptions['destPublishScriptFilePath']): Promise<boolean> => isDirectoryExists(path && dirname(path));

export default validator;
