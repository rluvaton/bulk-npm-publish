import 'jest-extended';
import { UserOptions as UserOptionsLib } from '../user-options';

import { IUserOptionGetter as IUserOptionGetterLib } from '../i-user-option-getter';
import { setPlatform } from '../../../tests/util';

interface TestsDep {
  UserOptions?: UserOptionsLib;
  IUserOptionGetter?: IUserOptionGetterLib;
  userOptionGetter: IUserOptionGetterLib;
}

function getDeps(): TestsDep {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { userOptionGetter } = require('./');

  return { userOptionGetter };
}

describe('Get User Options (from the available option)', () => {
  function startTest(
    platform: string,
  ): TestsDep & { userOptionPromptGetter: jest.SpiedFunction<IUserOptionGetterLib> } {
    setPlatform(platform);
    const dep = getDeps();
    const userOptionPromptGetter: jest.SpiedFunction<IUserOptionGetterLib> = jest.spyOn(dep, 'userOptionGetter');
    return { ...dep, userOptionPromptGetter };
  }

  beforeEach(() => {
    jest.resetModules(); // this is important - it clears the cache
  });

  function getOptionsAndEnsureCalledTimeAndArgs<IUserOptionGetter>(
    userOptionGetter,
    userOptionGetters: {
      args?: IUserOptionGetter;
      interactive?: IUserOptionGetter;
    },
  ): Promise<UserOptionsLib> {
    return userOptionGetter(userOptionGetters);
  }

  it('userOptionsGetter should be define', () => {
    const { userOptionGetter } = startTest('windows');
    expect(userOptionGetter).toBeDefined();
  });

  it('should throw error when userOptionGetters rejected', async () => {
    const { userOptionGetter } = startTest('linux');
    const pr = getOptionsAndEnsureCalledTimeAndArgs(userOptionGetter, {
      args: () => Promise.reject(new Error('Test for rejection')),
    });

    await expect(pr).toReject();

    const rejectResult = await pr.catch((e) => e);
    expect(rejectResult).toBeDefined();
    expect(rejectResult).toBeInstanceOf(Error);
    expect(rejectResult).toHaveProperty('message', "Couldn't get user options");
  });

  it('should throw error when all userOptionGetters rejected', async () => {
    const { userOptionGetter } = startTest('linux');
    const pr = getOptionsAndEnsureCalledTimeAndArgs(userOptionGetter, {
      args: () => Promise.reject(new Error('Test for rejection 1')),
      interactive: () => Promise.reject(new Error('Test for rejection 2')),
    });

    await expect(pr).toReject();

    const rejectResult = await pr.catch((e) => e);
    expect(rejectResult).toBeDefined();
    expect(rejectResult).toBeInstanceOf(Error);
    expect(rejectResult).toHaveProperty('message', "Couldn't get user options");
  });

  it('should get the first user options that resolved', async () => {
    const { userOptionGetter } = startTest('windows');
    const expectedUserOptions: UserOptionsLib = {
      storagePath: 'C://storage/',
      destPublishScriptFilePath: './publish.bat',
      npmPublishOptions: {
        registry: undefined,
      },
      onlyNew: {
        enable: false,
        registry: undefined,
      },
    };

    const pr = getOptionsAndEnsureCalledTimeAndArgs<IUserOptionGetterLib>(userOptionGetter, {
      args: () =>
        Promise.resolve({
          storagePath: expectedUserOptions.storagePath,
          destPublishScriptFilePath: expectedUserOptions.destPublishScriptFilePath,
        }),
      interactive: () =>
        Promise.resolve({
          storagePath: 'C://some-other-storage/',
          destPublishScriptFilePath: './publish-file.bat',
        }),
    });
    await expect(pr).toResolve();

    const userOptions = await pr;
    expect(userOptions).toEqual(expectedUserOptions);
  });

  it('should get the first user options that not rejected', async () => {
    const { userOptionGetter } = startTest('windows');

    const expectedUserOptions: UserOptionsLib = {
      storagePath: 'C://storage/',
      destPublishScriptFilePath: './my-publish-script.bat',
      npmPublishOptions: {
        registry: undefined,
      },
      onlyNew: {
        enable: false,
        registry: undefined,
      },
    };

    const pr = getOptionsAndEnsureCalledTimeAndArgs(userOptionGetter, {
      args: () => Promise.reject(new Error('Rejected promise')),
      interactive: () =>
        Promise.resolve({
          storagePath: expectedUserOptions.storagePath,
          destPublishScriptFilePath: expectedUserOptions.destPublishScriptFilePath,
        }),
    });

    await expect(pr).toResolve();

    const userOptions = await pr;
    expect(userOptions).toEqual(expectedUserOptions);
  });

  it('should get provided storage path and default values for destPublishScriptFilePath npmPublishOptions.registry (on Windows)', async () => {
    const { userOptionGetter } = startTest('windows');
    const expectedUserOptions: UserOptionsLib = {
      storagePath: 'C://storage/',
      destPublishScriptFilePath: './publish.bat',
      npmPublishOptions: {
        registry: undefined,
      },
      onlyNew: {
        enable: false,
        registry: undefined,
      },
    };

    const pr = getOptionsAndEnsureCalledTimeAndArgs(userOptionGetter, {
      args: () => Promise.resolve({ storagePath: expectedUserOptions.storagePath }),
    });
    await expect(pr).toResolve();

    const userOptions = await pr;
    expect(userOptions).toEqual(expectedUserOptions);
  });

  it('should get provided storage path and default values for destPublishScriptFilePath npmPublishOptions.registry (on Linux)', async () => {
    const { userOptionGetter } = startTest('linux');

    const expectedUserOptions: UserOptionsLib = {
      storagePath: '/home/root/my-storage/',
      destPublishScriptFilePath: './publish.sh',
      npmPublishOptions: {
        registry: undefined,
      },
      onlyNew: {
        enable: false,
        registry: undefined,
      },
    };

    const pr = getOptionsAndEnsureCalledTimeAndArgs(userOptionGetter, {
      args: () => Promise.resolve({ storagePath: expectedUserOptions.storagePath }),
    });
    await expect(pr).toResolve();

    const userOptions = await pr;
    expect(userOptions).toEqual(expectedUserOptions);
  });
});
