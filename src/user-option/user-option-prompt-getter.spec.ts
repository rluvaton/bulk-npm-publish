import 'jest-extended';

import createSpy = jasmine.createSpy;
import Spy = jasmine.Spy;
import {IUserOptionGetter} from './i-user-option-getter';
import {UserOptions} from './user-options';


function getDeps(): { prompts: any, UserOptions: UserOptions, IUserOptionGetter: IUserOptionGetter, UserOptionPromptGetter: IUserOptionGetter } {
  const prompts = require('prompts');
  const {UserOptions} = require('./user-options');
  const {IUserOptionGetter} = require('./i-user-option-getter');
  const {userOptionPromptGetter: UserOptionPromptGetter} = require('./user-option-prompt-getter');

  return {prompts, UserOptions, IUserOptionGetter, UserOptionPromptGetter};
}

describe('Get User Options from User Input', () => {
  let originalPlatform;
  const setPlatform = (platform: string) => {
    Object.defineProperty(process, 'platform', {
      value: platform
    });
  };

  function startTest(platform: string): { prompts: any, UserOptions: UserOptions, IUserOptionGetter: IUserOptionGetter, UserOptionPromptGetter: IUserOptionGetter, userOptionPromptGetter: Spy & IUserOptionGetter}  {
    setPlatform(platform);
    const dep = getDeps();
    const userOptionPromptGetter: Spy & IUserOptionGetter = createSpy('userOptionPromptGetter', dep.UserOptionPromptGetter).and.callThrough();
    return {...dep, userOptionPromptGetter};
  }

  beforeAll(() => {
    originalPlatform = process.platform;
  });

  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    setPlatform(originalPlatform);
  });

  afterAll(() => {
    setPlatform(originalPlatform);
  });

  it('userOptionPromptGetter should be define', () => {
    const {userOptionPromptGetter} = require('./user-option-prompt-getter');
    expect(userOptionPromptGetter).toBeDefined();
  });

  it('should get provided storage path and default values for destPublishScriptFilePath npmPublishOptions.registry (platform is windows)', async () => {
    const {prompts, UserOptions, userOptionPromptGetter} = startTest('win32');
    const expectedUserOptions: typeof UserOptions = {
      storagePath: 'C://storage-to-publish',
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
    await expect(pr).toResolve();

    const userOptions = await pr;
    expect(userOptions).toEqual(expectedUserOptions);
  });

  it('should get provided storage path and default values for destPublishScriptFilePath npmPublishOptions.registry (Linux platform)', async () => {
    const {prompts, UserOptions, userOptionPromptGetter} = startTest('linux');
    const expectedUserOptions: typeof UserOptions = {
      storagePath: '/home/user/storage-to-publish',
      destPublishScriptFilePath: './publish.sh',
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
    await expect(pr).toResolve();

    const userOptions = await pr;
    expect(userOptions).toEqual(expectedUserOptions);
  });

  it('should get provided storage path and publish script file path with default value for npmPublishOptions.registry', async () => {
    const {prompts, UserOptions, userOptionPromptGetter} = startTest('win32');
    const expectedUserOptions: typeof UserOptions = {
      storagePath: 'C://storage-to-publish',
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
    await expect(pr).toResolve();

    const userOptions = await pr;
    expect(userOptions).toEqual(expectedUserOptions);
  });

  it('should get provided storage path, publish script file path and npmPublishOptions.registry', async () => {
    const {prompts, UserOptions, userOptionPromptGetter} = startTest('win32');
    const expectedUserOptions: typeof UserOptions = {
      storagePath: 'C://storage-to-publish',
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
    await expect(pr).toResolve();

    const userOptions = await pr;
    expect(userOptions).toEqual(expectedUserOptions);
  });

  it('should get provided storage path, publish script file path and npmPublishOptions.registry and with storagePath', async () => {
    const {prompts, UserOptions, userOptionPromptGetter} = startTest('win32');
    const expectedUserOptions: typeof UserOptions = {
      storagePath: 'C://storage-to-publish',
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
    await expect(pr).toResolve();

    const userOptions = await pr;
    expect(userOptions).toEqual(expectedUserOptions);
  });

  it('should throw error that said `Canceled` when exiting before finish', async () => {
    const {prompts, userOptionPromptGetter} = startTest('win32');

    // Inject simulated user abort
    prompts.inject([new Error('simulate cancel')]);

    expect(userOptionPromptGetter).toHaveBeenCalledTimes(0);
    const pr = userOptionPromptGetter();
    expect(userOptionPromptGetter).toHaveBeenCalledTimes(1);
    expect(userOptionPromptGetter).toBeCalledWith();
    await expect(pr).toReject();

    const rejectResult = await pr.catch((e) => e);
    expect(rejectResult).toBeDefined();
    expect(rejectResult).toBeInstanceOf(Error);
    expect(rejectResult).toHaveProperty('message', 'Cancelled');
  });
});
