import 'jest-extended';
import {UserOptions} from './user-options';
import * as prompts from 'prompts';
import {userOptionGetter as UserOptionGetter} from './user-options-getter';
import * as dotenv from 'dotenv';
import * as path from 'path';
import Spy = jasmine.Spy;
import createSpy = jasmine.createSpy;
import {IUserOptionGetter} from './i-user-option-getter';
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

describe('Get User Options (from the available option)', () => {
  let userOptionGetter: IUserOptionGetter & Mock;

  // @ts-ignore
  dotenv.config = createSpy('config', dotenv.config).and.callThrough();

  beforeAll(() => {
    userOptionGetter = jest.fn(UserOptionGetter);
  });

  afterAll(() => {
    userOptionGetter.mockReset();
  });

  function getOptionsAndEnsureCalledTimeAndArgs(): Promise<UserOptions> {
    expect(userOptionGetter).toHaveBeenCalledTimes(0);
    const pr = userOptionGetter();
    expect(userOptionGetter).toHaveBeenCalledTimes(1);
    expect(userOptionGetter).toBeCalledWith();
    return pr;
  }

  function setDotEnvConfigReturnValue(result: DotenvConfigOutput) {
    (dotenv.config as Spy).and.returnValue(result);
  }

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
  });

  it('userOptionsGetter should be define', () => {
    expect(userOptionGetter).toBeDefined();
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

  it('When no environment file provided get the options from user input', async () => {
    // Inject the values
    (dotenv.config as Spy).and.callThrough();

    // The path don't exist on purpose simulate not existing env file
    const result = dotenv.config({path: './made/up/path/.env'});
    setDotEnvConfigReturnValue(result);

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

    const pr = getOptionsAndEnsureCalledTimeAndArgs();
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

  it('When no environment file provided and user exited in the middle should throw Error with `cancel` message', async () => {

    (dotenv.config as Spy).and.callThrough();

    // The path don't exist on purpose simulate not existing env file
    // noinspection UnnecessaryLocalVariableJS
    const result = dotenv.config({path: './made/up/path/.env'});

    // Set the result to failed one
    setDotEnvConfigReturnValue(result);

    // Inject simulated user abort
    prompts.inject([new Error('simulate cancel')]);

    const pr = getOptionsAndEnsureCalledTimeAndArgs();
    await expect(pr).toReject();

    const rejectResult = await pr.catch((e) => e);
    expect(rejectResult).toBeDefined();
    expect(rejectResult).toBeInstanceOf(Error);
    expect(rejectResult).toHaveProperty('message', 'cancel');
  });
});
