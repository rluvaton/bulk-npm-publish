import 'jest-extended';
import {UserOptions} from './user-options';
import {userOptionEnvGetter as UserOptionEnvGetter} from './user-option-env-getter';

import * as mock from 'mock-fs';
import * as dotenv from 'dotenv';
import {DotenvConfigOutput} from 'dotenv';
import {IUserOptionGetter} from './i-user-option-getter';
import createSpy = jasmine.createSpy;
import Spy = jasmine.Spy;
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

describe('Get User Options from Environment file', () => {
  let userOptionEnvGetter: IUserOptionGetter & Mock = jest.fn(UserOptionEnvGetter);

  // @ts-ignore
  dotenv.config = createSpy('config', dotenv.config);

  afterAll(() => {
    userOptionEnvGetter.mockReset();
  });

  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules(); // this is important - it clears the cache
    process.env = {...OLD_ENV};

    userOptionEnvGetter.mockClear();

    // Reset to real implementation
    (dotenv.config as Spy).and.callThrough();
  });

  afterEach(() => {
    process.env = OLD_ENV;
    mock.restore();
  });

  it('userOptionEnvGetter should be define', () => {
    expect(userOptionEnvGetter).toBeDefined();
  });

  function getOptionsAndEnsureCalledTimeAndArgs(): Promise<UserOptions> {
    expect(userOptionEnvGetter).toHaveBeenCalledTimes(0);
    const pr = userOptionEnvGetter();
    expect(userOptionEnvGetter).toHaveBeenCalledTimes(1);
    expect(userOptionEnvGetter).toBeCalledWith();
    return pr;
  }

  function setDotEnvConfigReturnValue(result: DotenvConfigOutput) {
    (dotenv.config as Spy).and.returnValue(result);
  }

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
    setDotEnvConfigReturnValue(setEnv(`STORAGE_PATH=${expectedUserOptions.storagePath}`));


    // Set the result to successful one because there is not really .env file
    // setDotEnvConfigReturnValue(result);

    const pr = getOptionsAndEnsureCalledTimeAndArgs();
    await expect(pr).toResolve();

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
    setDotEnvConfigReturnValue(setEnv(`
      STORAGE_PATH=${expectedUserOptions.storagePath}
      PUBLISH_SCRIPT_DEST_PATH=${expectedUserOptions.destPublishScriptFilePath}
    `));

    const pr = getOptionsAndEnsureCalledTimeAndArgs();
    await expect(pr).toResolve();

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
    setDotEnvConfigReturnValue(setEnv(`
      STORAGE_PATH=${expectedUserOptions.storagePath}
      PUBLISH_SCRIPT_DEST_PATH=${expectedUserOptions.destPublishScriptFilePath}
      REGISTRY_URL=${expectedUserOptions.npmPublishOptions.registry}
    `));

    const pr = getOptionsAndEnsureCalledTimeAndArgs();
    await expect(pr).toResolve();

    const userOptions = await pr;
    expect(userOptions).toEqual(expectedUserOptions);
  });

  it('should throw error when there are no `.env` file', async () => {

    // The path don't exist on purpose simulate not existing env file

    // Set the result to failed one
    setDotEnvConfigReturnValue(setEnv(undefined));

    const pr = getOptionsAndEnsureCalledTimeAndArgs();
    await expect(pr).toReject();

    const rejectResult = await pr.catch((e) => e);
    expect(rejectResult).toBeDefined();
    expect(rejectResult).toBeInstanceOf(Error);
    expect(rejectResult).toHaveProperty('message', 'Error on parsing environment user options');
  });
});
