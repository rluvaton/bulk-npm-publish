import 'jest-extended';
import {UserOptions} from './user-options';
import {UserOptionEnvGetter} from './user-option-env-getter';
import * as dotenv from 'dotenv';
import * as path from 'path';
import Spy = jasmine.Spy;
import createSpy = jasmine.createSpy;

describe('Get User Options from Environment file', () => {
  it('UserOptionEnvGetter should be define', () => {
    expect(UserOptionEnvGetter).toBeDefined();
  });

  it('UserOptionEnvGetter.instance should be define', () => {
    expect(UserOptionEnvGetter.instance).toBeDefined();
  });

  it('UserOptionEnvGetter.instance should instance of UserOptionEnvGetter', () => {
    expect(UserOptionEnvGetter.instance).toBeInstanceOf(UserOptionEnvGetter);
  });

  it('UserOptionEnvGetter.instance should get the same instance each time', () => {
    expect(UserOptionEnvGetter.instance).toEqual(UserOptionEnvGetter.instance);
  });

  it('should have `get` method', () => {
    expect(UserOptionEnvGetter.instance.get).toBeFunction();
  });

  describe('#get', () => {
    interface EnvFileStructure {
      STORAGE_PATH?: string;
      PUBLISH_SCRIPT_DEST_PATH?: string;
      REGISTRY_URL?: string;
    }

    function setEnv(env: EnvFileStructure) {
      Object.assign(process.env, env);
    }

    function clearEnv(keys: (keyof EnvFileStructure)[]) {
      keys.forEach((key) => {
        delete process.env[key];
      });
    }

    let get: (() => Promise<UserOptions>) & Spy;

    beforeEach(() => {
      // MUST call `bind` or it won't be able to access the class properties (we in a different scope)
      get = createSpy('get', UserOptionEnvGetter.instance.get.bind(UserOptionEnvGetter.instance)).and.callThrough();
    });

    afterEach(() => {
      get = undefined;
      clearEnv(['STORAGE_PATH', 'PUBLISH_SCRIPT_DEST_PATH', 'REGISTRY_URL']);
    });


    it('should get provided storage path and default values for destPublishScriptFilePath npmPublishOptions.registry', async () => {
      const expectedUserOptions: UserOptions = {
        storagePath: 'C://',
        destPublishScriptFilePath: './publish.bat',
        npmPublishOptions: {
          registry: undefined
        }
      };

      const result = dotenv.config({path: path.resolve(__dirname, '../../files-for-tests/.env')});

      setEnv({
        STORAGE_PATH: expectedUserOptions.storagePath,
      });

      // Set the result to successful one because there is not really .env file
      // @ts-ignore
      UserOptionEnvGetter.instance._result = result;

      // Inject the values

      expect(get).toHaveBeenCalledTimes(0);
      const pr = get();
      expect(get).toHaveBeenCalledTimes(1);
      expect(get).toBeCalledWith();
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
        }
      };

      const result = dotenv.config({path: path.resolve(__dirname, '../../files-for-tests/.env')});

      setEnv({
        STORAGE_PATH: expectedUserOptions.storagePath,
        PUBLISH_SCRIPT_DEST_PATH: expectedUserOptions.destPublishScriptFilePath
      });

      // Set the result to successful one because there is not really .env file
      // @ts-ignore
      UserOptionEnvGetter.instance._result = result;

      // Inject the values

      expect(get).toHaveBeenCalledTimes(0);
      const pr = get();
      expect(get).toHaveBeenCalledTimes(1);
      expect(get).toBeCalledWith();
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
        }
      };

      const result = dotenv.config({path: path.resolve(__dirname, '../../files-for-tests/.env')});

      setEnv({
        STORAGE_PATH: expectedUserOptions.storagePath,
        PUBLISH_SCRIPT_DEST_PATH: expectedUserOptions.destPublishScriptFilePath,
        REGISTRY_URL: expectedUserOptions.npmPublishOptions.registry
      });

      // Set the result to successful one because there is not really .env file
      // @ts-ignore
      UserOptionEnvGetter.instance._result = result;

      // Inject the values

      expect(get).toHaveBeenCalledTimes(0);
      const pr = get();
      expect(get).toHaveBeenCalledTimes(1);
      expect(get).toBeCalledWith();
      expect(pr).toResolve();

      const userOptions = await pr;
      expect(userOptions).toEqual(expectedUserOptions);
    });

    it('should throw error when there are no `.env` file', async () => {

      // The path don't exist on purpose simulate not existing env file
      // noinspection UnnecessaryLocalVariableJS
      const result = dotenv.config({path: './made/up/path/.env'});

      // Set the result to failed one
      // @ts-ignore
      UserOptionEnvGetter.instance._result = result;

      expect(get).toHaveBeenCalledTimes(0);
      const pr = get();
      expect(get).toHaveBeenCalledTimes(1);
      expect(get).toBeCalledWith();
      expect(pr).toReject();

      const rejectResult = await pr.catch((e) => e);
      expect(rejectResult).toBeDefined();
      expect(rejectResult).toBeInstanceOf(Error);
      expect(rejectResult).toHaveProperty('message', 'Error on parsing environment user options');
    });
  });
});
