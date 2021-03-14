import {IUserOptionGetter} from '../i-user-option-getter';
import {DEFAULT_USER_OPTIONS} from '../user-options';
import * as prompts from 'prompts';
import {logger} from '../../logger';
import {deepClone} from '../../utils';
import {validateStorage, validateDestPublishScriptFilePath, validateNpmPublishOptionsIfSpecified, validateOnlyNewOptionsIfSpecified} from '../validator';


const _questions = [
  {
    type: 'text',
    name: 'storagePath',
    message: `What's the storage path to publish?`,
    validate: (path) => validateStorage(path).catch(err => err.message),
  },
  {
    type: 'text',
    name: 'destPublishScriptFilePath',
    message: `Where the publish script will be created`,
    initial: DEFAULT_USER_OPTIONS.destPublishScriptFilePath,
    validate: (path) => validateDestPublishScriptFilePath(path).catch(err => err.message),
  },
  {
    type: 'text',
    name: 'npmPublishOptions.registry',
    message: `What is the registry url you want to publish to`,
    initial: DEFAULT_USER_OPTIONS?.npmPublishOptions?.registry,
    validate: (registry) => !registry || validateNpmPublishOptionsIfSpecified({registry}).catch(err => err.message)
  },
  {
    type: 'confirm',
    name: 'createNewOnly',
    message: `Should publish only new packages`,
    initial: DEFAULT_USER_OPTIONS?.onlyNew?.enable,
  },
  {
    type: (createNewOnlyRes) => createNewOnlyRes ? 'text' : null,
    name: 'currentStorage',
    message: `What's the path for the current storage`,
    initial: DEFAULT_USER_OPTIONS?.onlyNew?.currentStoragePath,
    validate: (path) => validateOnlyNewOptionsIfSpecified({enable: true, currentStoragePath: path}).catch(err => err.message)
  },
];

const getQuestions = () => {
  // run clone on each variable request because the questions array is being modified and it's setting values
  return deepClone(_questions);
};

export const userOptionPromptGetter: IUserOptionGetter = async () => {
  let isCanceled = false;
  const questions = getQuestions();
  const response = await prompts(questions, {
    onCancel: () => {
      logger.debug('user cancelled');
      isCanceled = true;
      return false;
    }
  });

  if (isCanceled) {
    throw new Error('Cancelled');
  }

  logger.debug('user input in prompts', response);

  if (!response) {
    throw new Error('Error on trying to get input from console');
  }

  return {
    storagePath: response.storagePath,
    destPublishScriptFilePath: response.destPublishScriptFilePath,
    npmPublishOptions: {
      registry: response['npmPublishOptions.registry']
    },
    onlyNew: {
      enable: response.createNewOnly,
      currentStoragePath: response.currentStorage
    }
  };
};
