import * as dotenv from 'dotenv';
import {IUserOptionGetter} from '../i-user-option-getter';
import {DEFAULT_USER_OPTIONS, setDefaultUserOptionsProperties, UserOptions} from '../user-options';
import {logger} from '../../logger';
import * as emoji from 'node-emoji';


/**
 * Remove undefined properties
 * @param userOptions
 * @return The updated user options
 * @note Don't handle circular refs
 */
const removeUndefinedProperties = (userOptions) => {
  Object.keys(userOptions).forEach((key) => {
    if (typeof userOptions[key] === 'undefined') {
      delete userOptions[key];
    }

    if (typeof userOptions[key] === 'object') {
      userOptions[key] = removeUndefinedProperties(userOptions[key]);
    }
  });

  return userOptions;
};

const _getEnvResult = () => {
  return dotenv.config();
};

/**
 * @deprecated Use {@link userOptionPromptGetter} instead
 */
export const userOptionEnvGetter: IUserOptionGetter = () => {
  const envResult = _getEnvResult();

  if (envResult.error) {
    return Promise.reject(new Error('Error on parsing environment user options'));
  }

  logger.warn(emoji.get(':wastebasket:') + ' environment support is deprecated and will be deleted in future version');

  const userOptions = removeUndefinedProperties({
    storagePath: process.env.STORAGE_PATH,
    destPublishScriptFilePath: process.env.PUBLISH_SCRIPT_DEST_PATH,
    npmPublishOptions: {
      registry: process.env.REGISTRY_URL
    }
  });

  const options: UserOptions = setDefaultUserOptionsProperties(userOptions, DEFAULT_USER_OPTIONS);

  return Promise.resolve(options);
};
