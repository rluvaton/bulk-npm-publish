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
export const validateStorage = async (path?: UserOptions['storagePath']): Promise<boolean> => !!path && await isDirectoryExists(path);

/**
 * Validate that the parent folder of the file path exists
 * @param path file path
 * @return If the parent directory exists.
 */
export const validateDestPublishScriptFilePath = async (path?: UserOptions['destPublishScriptFilePath']): Promise<boolean> =>
  !!path && isValidPath(path) && isDirectoryExists(dirname(path));

export const validateNpmPublishOptionsIfSpecified = async (npmPublishOptions?: UserOptions['npmPublishOptions']) => {
  // If npmPublishOptions.registry isn't provided then it's valid if it's provided but not a url it's not
  return (npmPublishOptions?.registry && isWebUri(npmPublishOptions.registry)) ?? true;
};

export const validateOnlyNewOptionsIfSpecified = async (onlyNewOptions?: UserOptions['onlyNew']) =>
  !onlyNewOptions?.enable ||
  (
    onlyNewOptions.currentStoragePath &&
    isValidPath(onlyNewOptions.currentStoragePath) &&
    // tslint:disable-next-line:no-return-await
    await (validateStorage(onlyNewOptions.currentStoragePath).catch(() => false))
  );
