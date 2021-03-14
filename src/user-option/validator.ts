import {UserOptions} from './user-options';
import {isDirectoryExists} from '../fs-utils';
import {dirname} from 'path';
import {isWebUri} from 'valid-url';
// @ts-ignore
import * as isValidPath from 'is-valid-path';

export const validateUserOptions = async (options: Partial<UserOptions>): Promise<boolean> => {
  return (await Promise.all([
    validateStorage(options?.storagePath),
    validateDestPublishScriptFilePath(options?.destPublishScriptFilePath),
    validateNpmPublishOptionsIfSpecified(options?.npmPublishOptions),
    validateOnlyNewOptionsIfSpecified(options?.onlyNew)
  ])).every((isValid) => isValid);
};

/**
 * Validate that storage path is a directory and exists.
 * @param path Verdaccio storage path.
 * @return If the path valid.
 */
export const validateStorage = async (path?: UserOptions['storagePath']): Promise<boolean> => {
  if (path === undefined) {
    throw new Error('Missing path');
  }

  if (path === '' || !isValidPath(path)) {
    throw new Error('Invalid path');
  }

  if (!await isDirectoryExists(path)) {
    throw new Error('Directory does not exist');
  }

  return true;
};

/**
 * Validate that the path is valid and parent folder of the file path exists
 * @param path file path
 * @return If the parent directory exists.
 */
export const validateDestPublishScriptFilePath = async (path?: UserOptions['destPublishScriptFilePath']): Promise<boolean> => {
  if (!path || !isValidPath(path) || path.endsWith('\\') || path.endsWith('/')) {
    throw new Error('Invalid path');
  }

  if (!await isDirectoryExists(dirname(path))) {
    throw new Error('Parent folder does not exist');
  }

  if (await isDirectoryExists(path)) {
    throw new Error('There is directory already exists with this path');
  }

  return true;
};

export const validateNpmPublishOptionsIfSpecified = async (npmPublishOptions?: UserOptions['npmPublishOptions']): Promise<boolean> => {
  if (npmPublishOptions?.registry === undefined) {
    return true;
  }

  if (isWebUri(npmPublishOptions.registry) === undefined) {
    throw new Error('Registry is not valid http(s) url');
  }

  return true;
};

export const validateOnlyNewOptionsIfSpecified = async (onlyNewOptions?: UserOptions['onlyNew']): Promise<boolean> => {
  if (!onlyNewOptions?.enable) {
    return true;
  }

  return await validateStorage(onlyNewOptions.currentStoragePath);
};
