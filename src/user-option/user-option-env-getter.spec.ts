import 'jest-extended';
import {UserOptions} from './user-options';
import {userOptionEnvGetter as UserOptionEnvGetter} from './user-option-env-getter';
import * as dotenv from 'dotenv';
import * as path from 'path';
import createSpy = jasmine.createSpy;
import {IUserOptionGetter} from './i-user-option-getter';
import Spy = jasmine.Spy;
import Mock = jest.Mock;
import {DotenvConfigOutput} from 'dotenv';

interface EnvFileStructure {
  STORAGE_PATH?: string;
  PUBLISH_SCRIPT_DEST_PATH?: string;
  REGISTRY_URL?: string;
}

function setEnv(env: EnvFileStructure) {
  Object.assign(process.env, env);
}

describe('Get User Options from Environment file', () => {
  let userOptionEnvGetter: IUserOptionGetter & Mock;

  // @ts-ignore
  dotenv.config = createSpy('config', dotenv.config).and.callThrough();

  beforeAll(() => {
    userOptionEnvGetter = jest.fn(UserOptionEnvGetter);
  });

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
    (dotenv.config as Spy).and.callThrough();
    const result = dotenv.config({path: path.resolve(__dirname, '../../files-for-tests/.env')});

    setEnv({
      STORAGE_PATH: expectedUserOptions.storagePath,
    });

    // Set the result to successful one because there is not really .env file
    setDotEnvConfigReturnValue(result);

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
    (dotenv.config as Spy).and.callThrough();
    const result = dotenv.config({path: path.resolve(__dirname, '../../files-for-tests/.env')});

    setEnv({
      STORAGE_PATH: expectedUserOptions.storagePath,
      PUBLISH_SCRIPT_DEST_PATH: expectedUserOptions.destPublishScriptFilePath
    });

    // Set the result to successful one because there is not really .env file
    setDotEnvConfigReturnValue(result);

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
    (dotenv.config as Spy).and.callThrough();
    const result = dotenv.config({path: path.resolve(__dirname, '../../files-for-tests/.env')});

    setEnv({
      STORAGE_PATH: expectedUserOptions.storagePath,
      PUBLISH_SCRIPT_DEST_PATH: expectedUserOptions.destPublishScriptFilePath,
      REGISTRY_URL: expectedUserOptions.npmPublishOptions.registry
    });

    // Set the result to successful one because there is not really .env file
    setDotEnvConfigReturnValue(result);

    const pr = getOptionsAndEnsureCalledTimeAndArgs();
    await expect(pr).toResolve();

    const userOptions = await pr;
    expect(userOptions).toEqual(expectedUserOptions);
  });

  it('should throw error when there are no `.env` file', async () => {

    (dotenv.config as Spy).and.callThrough();

    // The path don't exist on purpose simulate not existing env file
    const result = dotenv.config({path: './made/up/path/.env'});

    // Set the result to failed one
    setDotEnvConfigReturnValue(result);

    const pr = getOptionsAndEnsureCalledTimeAndArgs();
    await expect(pr).toReject();

    const rejectResult = await pr.catch((e) => e);
    expect(rejectResult).toBeDefined();
    expect(rejectResult).toBeInstanceOf(Error);
    expect(rejectResult).toHaveProperty('message', 'Error on parsing environment user options');
  });
});
