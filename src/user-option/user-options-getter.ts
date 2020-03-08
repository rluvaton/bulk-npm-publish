import {IUserOptionGetter} from './i-user-option-getter';
import {UserOptions} from './user-options';
import {UserOptionEnvGetter} from './user-option-env-getter';
import {UserOptionPromptGetter} from './user-option-prompt-getter';
import {logger} from '../logger';
import * as emoji from 'node-emoji';

export class UserOptionsGetter implements IUserOptionGetter {
  public static readonly instance = new UserOptionsGetter();

  private constructor() {
  }

  async get(): Promise<UserOptions> {

    let options: UserOptions;

    try {
      options = await UserOptionEnvGetter.instance.get();
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
      options = await UserOptionPromptGetter.instance.get();
    } catch (e) {
      logger.debug('Cancelled', e);
      return Promise.reject(new Error('cancel'));
    }

    if (options) {
      return options;
    }

    throw new Error('Couldn\'t get user options');
  }
}
