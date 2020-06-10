import {IUserOptionGetter} from './i-user-option-getter';
import {DEFAULT_USER_OPTIONS, setDefaultUserOptionsProperties, UserOptions} from './user-options';
import {logger} from '../logger';

/**
 * Get the user options from one of the provided getters
 * @param userOptionGetters The getters (the order matter - will try to get from first and continue until the end)
 * @return Return user option that got from the provided getters
 * @throws Error Reject if the userOptionGetters isn't provided or is empty
 * @throws Error Reject if the couldn't get any options
 */
export const userOptionGetter: (userOptionGetters: IUserOptionGetter[]) => ReturnType<IUserOptionGetter> = async (userOptionGetters: IUserOptionGetter[]) => {
  if (!userOptionGetters || userOptionGetters.length === 0) {
    throw new Error('userOptionGetters not provided or has no items in it');
  }

  let options: UserOptions;

  for (const getter of userOptionGetters) {
    try {
      options = await getter();
      options = setDefaultUserOptionsProperties(options, DEFAULT_USER_OPTIONS);
    } catch (e) {
      logger.debug('Couldn\'t get userOptions, thrown error:', e);
      if (e.message === 'Cancelled') {
        logger.debug('Cancelled', e);
        return Promise.reject(new Error('cancel'));

      }
      continue;
    }

    return options;
  }

  throw new Error('Couldn\'t get user options');
};
