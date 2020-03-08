import * as dotenv from 'dotenv';
import {IUserOptionGetter} from './i-user-option-getter';
import {DEFAULT_USER_OPTIONS, setDefaultUserOptionsProperties, UserOptions} from './user-options';


/**
 * @deprecated Use {@link UserOptionPromptGetter} instead
 */
export class UserOptionEnvGetter implements IUserOptionGetter {
  public static readonly instance = new UserOptionEnvGetter();

  private _result;

  private constructor() {
    this._result = dotenv.config();
  }

  get(): Promise<UserOptions> {
    if (this._result.error) {
      return Promise.reject(new Error('Error on parsing environment user options'));
    }

    const userOptions = this._removeUndefinedProperties({
      storagePath: process.env.STORAGE_PATH,
      destPublishScriptFilePath: process.env.PUBLISH_SCRIPT_DEST_PATH,
      npmPublishOptions: {
        registry: process.env.REGISTRY_URL
      }
    });

    const options: UserOptions = setDefaultUserOptionsProperties(userOptions, DEFAULT_USER_OPTIONS);

    return Promise.resolve(options);
  }

  /**
   * Remove undefined properties
   * @param userOptions
   * @return The updated user options
   * @note Don't handle circular refs
   */
  private _removeUndefinedProperties(userOptions) {
    Object.keys(userOptions).forEach((key) => {
      if (typeof userOptions[key] === 'undefined') {
        delete userOptions[key];
      }

      if (typeof userOptions[key] === 'object') {
        userOptions[key] = this._removeUndefinedProperties(userOptions[key]);
      }
    });

    return userOptions;
  }
}
