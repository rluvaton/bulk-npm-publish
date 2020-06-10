import 'jest-extended';
import {UserOptions as UserOptionsLib} from './user-options';

import {IUserOptionGetter as IUserOptionGetterLib} from './i-user-option-getter';
import Spy = jasmine.Spy;
import createSpy = jasmine.createSpy;
import {setPlatform} from '../../tests/util';


function getDeps(): { UserOptions: UserOptionsLib, IUserOptionGetter: IUserOptionGetterLib, userOptionGetter: IUserOptionGetterLib } {
  const {UserOptions} = require('./user-options');
  const {IUserOptionGetter} = require('./i-user-option-getter');
  const {userOptionGetter} = require('./user-options-getter');

  return {UserOptions, IUserOptionGetter, userOptionGetter};
}

describe('Get User Options (from the available option)', () => {

  function startTest(platform: string): { UserOptions: UserOptionsLib, IUserOptionGetter: IUserOptionGetterLib, userOptionGetter: IUserOptionGetterLib, userOptionPromptGetter: Spy & IUserOptionGetterLib } {
    setPlatform(platform);
    const dep = getDeps();
    const userOptionPromptGetter: Spy & IUserOptionGetterLib = createSpy('userOptionGetter', dep.userOptionGetter).and.callThrough();
    return {...dep, userOptionPromptGetter};
  }

  beforeAll(() => {
  });

  beforeEach(() => {
    jest.resetModules(); // this is important - it clears the cache
  });

  function getOptionsAndEnsureCalledTimeAndArgs<IUserOptionGetter>(userOptionGetter, userOptionGetters: IUserOptionGetter[]): Promise<UserOptionsLib> {
    return userOptionGetter(userOptionGetters);
  }

  it('userOptionsGetter should be define', () => {
    const {userOptionGetter} = startTest('windows');
    expect(userOptionGetter).toBeDefined();
  });

  it('should throw error when no userOptionGetters passed', async () => {
    const {userOptionGetter} = startTest('linux');
    const pr = userOptionGetter();

    await expect(pr).toReject();

    const rejectResult = await pr.catch((e) => e);
    expect(rejectResult).toBeDefined();
    expect(rejectResult).toBeInstanceOf(Error);
    expect(rejectResult).toHaveProperty('message', 'userOptionGetters not provided or has no items in it');
  });

  it('should throw error when empty userOptionGetters passed', async () => {
    const {userOptionGetter} = startTest('linux');
    const pr = getOptionsAndEnsureCalledTimeAndArgs(userOptionGetter, []);

    await expect(pr).toReject();

    const rejectResult = await pr.catch((e) => e);
    expect(rejectResult).toBeDefined();
    expect(rejectResult).toBeInstanceOf(Error);
    expect(rejectResult).toHaveProperty('message', 'userOptionGetters not provided or has no items in it');
  });

  it('should throw error when userOptionGetters rejected', async () => {
    const {userOptionGetter} = startTest('linux');
    const pr = getOptionsAndEnsureCalledTimeAndArgs(userOptionGetter, [() => Promise.reject(new Error('Test for rejection'))]);

    await expect(pr).toReject();

    const rejectResult = await pr.catch((e) => e);
    expect(rejectResult).toBeDefined();
    expect(rejectResult).toBeInstanceOf(Error);
    expect(rejectResult).toHaveProperty('message', 'Couldn\'t get user options');
  });

  it('should throw error when all userOptionGetters rejected', async () => {
    const {userOptionGetter} = startTest('linux');
    const pr = getOptionsAndEnsureCalledTimeAndArgs(userOptionGetter, [() => Promise.reject(new Error('Test for rejection 1')), () => Promise.reject(new Error('Test for rejection 2'))]);

    await expect(pr).toReject();

    const rejectResult = await pr.catch((e) => e);
    expect(rejectResult).toBeDefined();
    expect(rejectResult).toBeInstanceOf(Error);
    expect(rejectResult).toHaveProperty('message', 'Couldn\'t get user options');
  });

  it('should get the first user options that resolved', async () => {
    const {IUserOptionGetter, UserOptions, userOptionGetter} = startTest('windows');
    const expectedUserOptions: typeof UserOptions = {
      storagePath: 'C://storage/',
      destPublishScriptFilePath: './publish.bat',
      npmPublishOptions: {
        registry: undefined
      },
      onlyNew: {
        enable: false,
        currentStoragePath: undefined
      }
    };

    const pr = getOptionsAndEnsureCalledTimeAndArgs<typeof IUserOptionGetter>(userOptionGetter, [
      () => Promise.resolve({
        storagePath: expectedUserOptions.storagePath,
        destPublishScriptFilePath: expectedUserOptions.destPublishScriptFilePath,
      }),
      () => Promise.resolve({
        storagePath: 'C://some-other-storage/',
        destPublishScriptFilePath: './publish-file.bat',
      }),
    ]);
    await expect(pr).toResolve();

    const userOptions = await pr;
    expect(userOptions).toEqual(expectedUserOptions);
  });

  it('should get the first user options that not rejected', async () => {
    const {UserOptions, userOptionGetter} = startTest('windows');

    const expectedUserOptions: typeof UserOptions = {
      storagePath: 'C://storage/',
      destPublishScriptFilePath: './my-publish-script.bat',
      npmPublishOptions: {
        registry: undefined
      },
      onlyNew: {
        enable: false,
        currentStoragePath: undefined
      }
    };

    const pr = getOptionsAndEnsureCalledTimeAndArgs(userOptionGetter, [
      () => Promise.reject(new Error('Rejected promise')),
      () => Promise.resolve({
        storagePath: expectedUserOptions.storagePath,
        destPublishScriptFilePath: expectedUserOptions.destPublishScriptFilePath
      })
    ]);

    await expect(pr).toResolve();

    const userOptions = await pr;
    expect(userOptions).toEqual(expectedUserOptions);
  });

  it('should get provided storage path and default values for destPublishScriptFilePath npmPublishOptions.registry (on Windows)', async () => {
    const {UserOptions, userOptionGetter} = startTest('windows');
    const expectedUserOptions: typeof UserOptions = {
      storagePath: 'C://storage/',
      destPublishScriptFilePath: './publish.bat',
      npmPublishOptions: {
        registry: undefined
      },
      onlyNew: {
        enable: false,
        currentStoragePath: undefined
      }
    };

    const pr = getOptionsAndEnsureCalledTimeAndArgs(userOptionGetter, [() => Promise.resolve({storagePath: expectedUserOptions.storagePath})]);
    await expect(pr).toResolve();

    const userOptions = await pr;
    expect(userOptions).toEqual(expectedUserOptions);
  });

  it('should get provided storage path and default values for destPublishScriptFilePath npmPublishOptions.registry (on Linux)', async () => {
    const {UserOptions, userOptionGetter} = startTest('linux');

    const expectedUserOptions: typeof UserOptions = {
      storagePath: '/home/root/my-storage/',
      destPublishScriptFilePath: './publish.sh',
      npmPublishOptions: {
        registry: undefined
      },
      onlyNew: {
        enable: false,
        currentStoragePath: undefined
      }
    };

    const pr = getOptionsAndEnsureCalledTimeAndArgs(userOptionGetter, [() => Promise.resolve({storagePath: expectedUserOptions.storagePath})]);
    await expect(pr).toResolve();

    const userOptions = await pr;
    expect(userOptions).toEqual(expectedUserOptions);
  });
});
