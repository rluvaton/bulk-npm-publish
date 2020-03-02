import {IUserOptionGetter} from './i-user-option-getter';
import {DEFAULT_USER_OPTIONS, UserOptions} from './user-options';
import * as prompts from 'prompts';

export class UserOptionPromptGetter implements IUserOptionGetter {
  public static readonly instance = new UserOptionPromptGetter();

  protected _questions = [
    {
      type: 'text',
      name: 'storagePath',
      message: `What's the storage path to publish?`,
      validate: (path) => !!path,
    },
    {
      type: 'text',
      name: 'destPublishScriptFilePath',
      message: `Where the publish script will be created`,
      initial: DEFAULT_USER_OPTIONS.destPublishScriptFilePath,
    },
    {
      type: 'text',
      name: 'npmPublishOptions.registry',
      message: `What is the registry url you want to publish to`,
      initial: DEFAULT_USER_OPTIONS.npmPublishOptions.registry,
    },
  ];

  private constructor() {
  }

  async get(): Promise<UserOptions> {
    let isCanceled = false;
    const response = await prompts(this._questions, {
      onCancel: () => {
        console.log('Canceling');
        isCanceled = true;
        return false;
      }
    });

    if (isCanceled) {
      throw new Error('Cancelled');
    }

    if (!response) {
      throw new Error('Error on trying to get input from console');
    }

    return {
      storagePath: response.storagePath,
      destPublishScriptFilePath: response.destPublishScriptFilePath,
      npmPublishOptions: {
        registry: response['npmPublishOptions.registry']
      },
    };
  }
}
