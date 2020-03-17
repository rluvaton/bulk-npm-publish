import {IUserOptionGetter} from './i-user-option-getter';
import {UserOptions} from './user-options';
import {userOptionEnvGetter} from './user-option-env-getter';
import {userOptionPromptGetter} from './user-option-prompt-getter';
import {logger} from '../logger';
import * as emoji from 'node-emoji';

export const userOptionGetter: IUserOptionGetter = async () => {
  let options: UserOptions;

  try {
    options = await userOptionEnvGetter();
  } catch (e) {
    logger.debug('Couldn\'t get user options from environment (check if you have .env file)', e);
    options = undefined;
  }

  if (options) {
    logger.warn(emoji.get(':wastebasket:') + ' environment support is deprecated and will be deleted in future version');
    return options;
  }

  try {
    logger.info('Getting user input by the console');
    options = await userOptionPromptGetter();
  } catch (e) {
    logger.debug('Cancelled', e);
    return Promise.reject(new Error('cancel'));
  }

  if (options) {
    return options;
  }

  throw new Error('Couldn\'t get user options');
}
