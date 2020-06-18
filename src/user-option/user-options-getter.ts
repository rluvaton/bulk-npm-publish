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
export const userOptionGetter: (userOptionGetters: {
  args?: IUserOptionGetter,
  interactive?: IUserOptionGetter,
}) => ReturnType<IUserOptionGetter> = async (userOptionGetters = {}) => {
  if (!userOptionGetters || Object.keys(userOptionGetters).length === 0) {
    throw new Error('One of the user option getter must be provided');
  }

  const {args, interactive} = userOptionGetters;

  let options: UserOptions;

  if (args) {
    try {
      options = await getOptions(args);
    } catch (e) {
      logger.error('Couldn\'t get userOptions using the args one, thrown error:', e);
      options = undefined;
    }

    if (options && !(options as UserOptions & { interactive?: boolean }).interactive) {
      return options;
    }
  }

  if (interactive) {
    try {
      options = await getOptions(interactive);
    } catch (e) {
      logger.debug('Couldn\'t get userOptions using the interactive one, thrown error:', e);
      if (e.message === 'Cancelled') {
        logger.debug('Cancelled', e);
        return new Error('cancel');
      }
    }
  }

  if (options) {
    return options;
  }

  throw new Error('Couldn\'t get user options');
};

const getOptions = async (getter: IUserOptionGetter) => {
  let options: UserOptions = await getter();
  return setDefaultUserOptionsProperties(options, DEFAULT_USER_OPTIONS);
};
