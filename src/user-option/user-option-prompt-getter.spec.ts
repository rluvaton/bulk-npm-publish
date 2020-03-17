import 'jest-extended';
import {UserOptions} from './user-options';
import * as prompts from 'prompts';
import createSpy = jasmine.createSpy;
import {IUserOptionGetter} from './i-user-option-getter';
import {userOptionPromptGetter as UserOptionPromptGetter} from './user-option-prompt-getter';

describe('Get User Options from User Input', () => {
  let userOptionPromptGetter: IUserOptionGetter;

  beforeEach(() => {
    userOptionPromptGetter = createSpy('userOptionPromptGetter', UserOptionPromptGetter).and.callThrough();
  });

  afterEach(() => {
    userOptionPromptGetter = undefined;
  });

  it('userOptionPromptGetter should be define', () => {
    expect(userOptionPromptGetter).toBeDefined();
  });

  it('should get provided storage path and default values for destPublishScriptFilePath npmPublishOptions.registry', async () => {
    const expectedUserOptions: UserOptions = {
      storagePath: 'C://',
      destPublishScriptFilePath: './publish.bat',
      npmPublishOptions: {
        registry: undefined
      },
      onlyNew: {
        enable: false,
        currentStoragePath: undefined
      }
    };

    // Inject the values
    prompts.inject([expectedUserOptions.storagePath, undefined, undefined]);

    expect(userOptionPromptGetter).toHaveBeenCalledTimes(0);
    const pr = userOptionPromptGetter();
    expect(userOptionPromptGetter).toHaveBeenCalledTimes(1);
    expect(userOptionPromptGetter).toBeCalledWith();
    expect(pr).toResolve();

    const userOptions = await pr;
    expect(userOptions).toEqual(expectedUserOptions);
  });

  it('should get provided storage path and publish script file path with default value for npmPublishOptions.registry', async () => {
    const expectedUserOptions: UserOptions = {
      storagePath: 'C://',
      destPublishScriptFilePath: './my-publish-script.bat',
      npmPublishOptions: {
        registry: undefined
      },
      onlyNew: {
        enable: false,
        currentStoragePath: undefined
      }
    };

    // Inject the values
    prompts.inject([expectedUserOptions.storagePath, expectedUserOptions.destPublishScriptFilePath, undefined]);

    expect(userOptionPromptGetter).toHaveBeenCalledTimes(0);
    const pr = userOptionPromptGetter();
    expect(userOptionPromptGetter).toHaveBeenCalledTimes(1);
    expect(userOptionPromptGetter).toBeCalledWith();
    expect(pr).toResolve();

    const userOptions = await pr;
    expect(userOptions).toEqual(expectedUserOptions);
  });

  it('should get provided storage path, publish script file path and npmPublishOptions.registry', async () => {
    const expectedUserOptions: UserOptions = {
      storagePath: 'C://',
      destPublishScriptFilePath: './my-publish-script.bat',
      npmPublishOptions: {
        registry: 'http://localhost:4873'
      },
      onlyNew: {
        enable: false,
        currentStoragePath: undefined
      }
    };

    // Inject the values
    prompts.inject([expectedUserOptions.storagePath, expectedUserOptions.destPublishScriptFilePath, expectedUserOptions.npmPublishOptions.registry]);

    expect(userOptionPromptGetter).toHaveBeenCalledTimes(0);
    const pr = userOptionPromptGetter();
    expect(userOptionPromptGetter).toHaveBeenCalledTimes(1);
    expect(userOptionPromptGetter).toBeCalledWith();
    expect(pr).toResolve();

    const userOptions = await pr;
    expect(userOptions).toEqual(expectedUserOptions);
  });

  it('should get provided storage path, publish script file path and npmPublishOptions.registry and with storagePath', async () => {
    const expectedUserOptions: UserOptions = {
      storagePath: 'C://',
      destPublishScriptFilePath: './my-publish-script.bat',
      npmPublishOptions: {
        registry: 'http://localhost:4873'
      },
      onlyNew: {
        enable: true,
        currentStoragePath: '../../storage/dir/'
      }
    };

    // Inject the values
    prompts.inject([
      expectedUserOptions.storagePath,
      expectedUserOptions.destPublishScriptFilePath,
      expectedUserOptions.npmPublishOptions.registry,
      expectedUserOptions.onlyNew.enable,
      expectedUserOptions.onlyNew.currentStoragePath
    ]);

    expect(userOptionPromptGetter).toHaveBeenCalledTimes(0);
    const pr = userOptionPromptGetter();
    expect(userOptionPromptGetter).toHaveBeenCalledTimes(1);
    expect(userOptionPromptGetter).toBeCalledWith();
    expect(pr).toResolve();

    const userOptions = await pr;
    expect(userOptions).toEqual(expectedUserOptions);
  });

  it('should throw error that said `Canceled` when exiting before finish', async () => {

    // Inject simulated user abort
    prompts.inject([new Error('simulate cancel')]);

    expect(userOptionPromptGetter).toHaveBeenCalledTimes(0);
    const pr = userOptionPromptGetter();
    expect(userOptionPromptGetter).toHaveBeenCalledTimes(1);
    expect(userOptionPromptGetter).toBeCalledWith();
    expect(pr).toReject();

    const rejectResult = await pr.catch((e) => e);
    expect(rejectResult).toBeDefined();
    expect(rejectResult).toBeInstanceOf(Error);
    expect(rejectResult).toHaveProperty('message', 'Cancelled');
  });
});
