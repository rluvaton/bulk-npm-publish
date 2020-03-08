import 'jest-extended';
import {UserOptionPromptGetter} from './user-option-prompt-getter';
import {UserOptions} from './user-options';
import * as prompts from 'prompts';
import Spy = jasmine.Spy;
import createSpy = jasmine.createSpy;

describe('Get User Options from User Input', () => {
  it('UserOptionPromptGetter should be define', () => {
    expect(UserOptionPromptGetter).toBeDefined();
  });

  it('UserOptionPromptGetter.instance should be define', () => {
    expect(UserOptionPromptGetter.instance).toBeDefined();
  });

  it('UserOptionPromptGetter.instance should instance of UserOptionPromptGetter', () => {
    expect(UserOptionPromptGetter.instance).toBeInstanceOf(UserOptionPromptGetter);
  });

  it('UserOptionPromptGetter.instance should get the same instance each time', () => {
    expect(UserOptionPromptGetter.instance).toEqual(UserOptionPromptGetter.instance);
  });

  it('should have `get` method', () => {
    expect(UserOptionPromptGetter.instance.get).toBeFunction();
  });

  describe('#get', () => {
    let get: (() => Promise<UserOptions>) & Spy;

    beforeEach(() => {
      // MUST call `bind` or it won't be able to access the class properties (we in a different scope)
      get = createSpy('get', UserOptionPromptGetter.instance.get.bind(UserOptionPromptGetter.instance)).and.callThrough();
    });

    afterEach(() => {
      get = undefined;
    });

    it('should get provided storage path and default values for destPublishScriptFilePath npmPublishOptions.registry', async () => {
      const expectedUserOptions: UserOptions = {
        storagePath: 'C://',
        destPublishScriptFilePath: './publish.bat',
        npmPublishOptions: {
          registry: undefined
        }
      };

      // Inject the values
      prompts.inject([expectedUserOptions.storagePath, undefined, undefined]);

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

      // Inject the values
      prompts.inject([expectedUserOptions.storagePath, expectedUserOptions.destPublishScriptFilePath, undefined]);

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

      // Inject the values
      prompts.inject([expectedUserOptions.storagePath, expectedUserOptions.destPublishScriptFilePath, expectedUserOptions.npmPublishOptions.registry]);

      expect(get).toHaveBeenCalledTimes(0);
      const pr = get();
      expect(get).toHaveBeenCalledTimes(1);
      expect(get).toBeCalledWith();
      expect(pr).toResolve();

      const userOptions = await pr;
      expect(userOptions).toEqual(expectedUserOptions);
    });

    it('should throw error that said `Canceled` when exiting before finish', async () => {

      // Inject simulated user abort
      prompts.inject([new Error('simulate cancel')]);

      expect(get).toHaveBeenCalledTimes(0);
      const pr = get();
      expect(get).toHaveBeenCalledTimes(1);
      expect(get).toBeCalledWith();
      expect(pr).toReject();

      const rejectResult = await pr.catch((e) => e);
      expect(rejectResult).toBeDefined();
      expect(rejectResult).toBeInstanceOf(Error);
      expect(rejectResult).toHaveProperty('message', 'Cancelled');
    });
  });
});
