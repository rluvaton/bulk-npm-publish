import 'jest-extended';
import {UserOptions} from './user-options';
import * as prompts from 'prompts';
import {userOptionGetter as UserOptionGetter} from './user-options-getter';

import * as mock from 'mock-fs';
import * as dotenv from 'dotenv';
import {DotenvConfigOutput} from 'dotenv';
import {IUserOptionGetter} from './i-user-option-getter';
import {userOptionEnvGetter} from './user-option-env-getter';
import {userOptionPromptGetter} from './user-option-prompt-getter';
import Spy = jasmine.Spy;
import createSpy = jasmine.createSpy;
import Mock = jest.Mock;


const setEnv = (dotEnvFileContent: string) => {
  if (dotEnvFileContent) {
    mock({
      envFiles: {
        '.env': dotEnvFileContent
      }
    });
  }

  return dotenv.config({path: 'envFiles/.env'});
};

describe('Get User Options (from the available option)', () => {
  let userOptionGetter: (typeof UserOptionGetter) & Mock;

  // @ts-ignore
  dotenv.config = createSpy('config', dotenv.config);

  beforeAll(() => {
    userOptionGetter = jest.fn(UserOptionGetter);
  });

  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules(); // this is important - it clears the cache
    process.env = {...OLD_ENV};

    userOptionGetter.mockClear();

    // Reset to real implementation
    (dotenv.config as Spy).and.callThrough();
  });

  afterEach(() => {
    process.env = OLD_ENV;
    mock.restore();
  });

  function getOptionsAndEnsureCalledTimeAndArgs(userOptionGetters: IUserOptionGetter[]): Promise<UserOptions> {
    expect(userOptionGetter).toHaveBeenCalledTimes(0);
    const pr = userOptionGetter(userOptionGetters);
    expect(userOptionGetter).toHaveBeenCalledTimes(1);
    expect(userOptionGetter).toBeCalledWith(userOptionGetters);
    return pr;
  }

  function setDotEnvConfigReturnValue(result: DotenvConfigOutput) {
    (dotenv.config as Spy).and.returnValue(result);
  }

  it('userOptionsGetter should be define', () => {
    expect(userOptionGetter).toBeDefined();
  });

  it('should throw error when no userOptionGetters passed', async () => {
    expect(userOptionGetter).toHaveBeenCalledTimes(0);
    const pr = userOptionGetter();
    expect(userOptionGetter).toHaveBeenCalledTimes(1);
    expect(userOptionGetter).toBeCalledWith();

    await expect(pr).toReject();

    const rejectResult = await pr.catch((e) => e);
    expect(rejectResult).toBeDefined();
    expect(rejectResult).toBeInstanceOf(Error);
    expect(rejectResult).toHaveProperty('message', 'userOptionGetters not provided or has no items in it');
  });

  it('should throw error when empty userOptionGetters passed', async () => {
    const pr = getOptionsAndEnsureCalledTimeAndArgs([]);

    await expect(pr).toReject();

    const rejectResult = await pr.catch((e) => e);
    expect(rejectResult).toBeDefined();
    expect(rejectResult).toBeInstanceOf(Error);
    expect(rejectResult).toHaveProperty('message', 'userOptionGetters not provided or has no items in it');
  });

  it('When environment file provided get the options from environment', async () => {
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
    setDotEnvConfigReturnValue(setEnv(`
      STORAGE_PATH=${expectedUserOptions.storagePath}
      PUBLISH_SCRIPT_DEST_PATH=${expectedUserOptions.destPublishScriptFilePath}
    `));

    const pr = getOptionsAndEnsureCalledTimeAndArgs([userOptionEnvGetter, userOptionPromptGetter]);
    await expect(pr).toResolve();

    const userOptions = await pr;
    expect(userOptions).toEqual(expectedUserOptions);
  });

  it('When no environment file provided get the options from user input', async () => {

    // The path don't exist on purpose simulate not existing env file
    setDotEnvConfigReturnValue(setEnv(undefined));

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

    const pr = getOptionsAndEnsureCalledTimeAndArgs([userOptionEnvGetter, userOptionPromptGetter]);
    await expect(pr).toResolve();

    const userOptions = await pr;
    expect(userOptions).toEqual(expectedUserOptions);
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
    setDotEnvConfigReturnValue(setEnv(`
      STORAGE_PATH=${expectedUserOptions.storagePath}
    `));

    const pr = getOptionsAndEnsureCalledTimeAndArgs([userOptionEnvGetter, userOptionPromptGetter]);
    await expect(pr).toResolve();

    const userOptions = await pr;
    expect(userOptions).toEqual(expectedUserOptions);
  });

  it('When no environment file provided and user exited in the middle should throw Error with `cancel` message', async () => {

    // Simulate not existing env file
    setDotEnvConfigReturnValue(setEnv(undefined));

    // Inject simulated user abort
    prompts.inject([new Error('simulate cancel')]);

    const pr = getOptionsAndEnsureCalledTimeAndArgs([userOptionEnvGetter, userOptionPromptGetter]);
    await expect(pr).toReject();

    const rejectResult = await pr.catch((e) => e);
    expect(rejectResult).toBeDefined();
    expect(rejectResult).toBeInstanceOf(Error);
    expect(rejectResult).toHaveProperty('message', 'Couldn\'t get user options');
  });
});
