import 'jest-extended';
import {setPlatform} from '../../tests/util';
// Doing these because we drop support to env files
setPlatform('linux');

let UserOptions: any;
let UserOptionEnvGetter: any;

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

  const OLD_ENV = process.env;

  beforeAll(() => {
    jest.isolateModules(() => {
      // const utils = require('../utils');
      UserOptions = require('./user-options').UserOptions;
      UserOptionEnvGetter = require('./user-option-env-getter').userOptionEnvGetter;
      userOptionEnvGetter = jest.fn(UserOptionEnvGetter);
    });
  });

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

  afterAll(() => {
    userOptionEnvGetter.mockReset();
  });

  it('userOptionEnvGetter should be define', () => {
    expect(userOptionEnvGetter).toBeDefined();
  });

  function getOptionsAndEnsureCalledTimeAndArgs(): Promise<typeof UserOptions> {
    expect(userOptionEnvGetter).toHaveBeenCalledTimes(0);
    const pr = userOptionEnvGetter();
    expect(userOptionEnvGetter).toHaveBeenCalledTimes(1);
    expect(userOptionEnvGetter).toBeCalledWith();
    return pr;
  }

  function setDotEnvConfigReturnValue(result: DotenvConfigOutput) {
    (dotenv.config as Spy).and.returnValue(result);
  }

  it('should get provided storage path and default values for destPublishScriptFilePath npmPublishOptions.registry (Linux)', async () => {
    const expectedUserOptions: typeof UserOptions = {
      storagePath: '/home/user/my-storage/',
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
    setDotEnvConfigReturnValue(setEnv(`STORAGE_PATH=${expectedUserOptions.storagePath}`));

    const pr = getOptionsAndEnsureCalledTimeAndArgs();
    await expect(pr).toResolve();

    const userOptions = await pr;
    expect(userOptions).toEqual(expectedUserOptions);
  });

  it('should get provided storage path and publish script file path with default value for npmPublishOptions.registry', async () => {
    const expectedUserOptions: typeof UserOptions = {
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
    const expectedUserOptions: typeof UserOptions = {
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
