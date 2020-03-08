import {IUserOptionGetter} from './i-user-option-getter';
import {UserOptions} from './user-options';
import {UserOptionEnvGetter} from './user-option-env-getter';
import {UserOptionPromptGetter} from './user-option-prompt-getter';

export class UserOptionsGetter implements IUserOptionGetter {
  public static readonly instance = new UserOptionsGetter();

  private constructor() {
  }

  async get(): Promise<UserOptions> {

    let options: UserOptions;

    try {
      options = await UserOptionEnvGetter.instance.get();
    } catch (e) {
      console.warn('Couldn\'t get user options from environment (check if you have .env file)', e);
      options = undefined;
    }

    if (options) {
      console.warn('environment support is deprecated and will be deleted in future version');
      return options;
    }

    try {
      console.log('Getting user input by the console');
      options = await UserOptionPromptGetter.instance.get();
    } catch (e) {
      console.error('Cancelled', e);
      options = undefined;
    }

    if (options) {
      return options;
    }

    throw new Error('Couldn\'t get user options');
  }
}
