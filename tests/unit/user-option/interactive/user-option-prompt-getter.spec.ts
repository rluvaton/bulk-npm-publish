import 'jest-extended';

import {IUserOptionGetter as IUserOptionGetterLib} from '../../../../src/user-option/i-user-option-getter';
import {UserOptions as UserOptionsLib} from '../../../../src/user-option/user-options';
import {setPlatform} from '../../../util';
import Mock = jest.Mock;

interface TestDeps {
  prompts: any;
  UserOptions: UserOptionsLib;
  IUserOptionGetter: IUserOptionGetterLib;
  UserOptionPromptGetter: { userOptionPromptGetter: IUserOptionGetterLib };
  userOptionPromptGetter?: IUserOptionGetterLib;
}

function getDeps(): TestDeps {
  const prompts = require('prompts');
  const {UserOptions} = require('../../../../src/user-option/user-options');
  const {IUserOptionGetter} = require('../../../../src/user-option/i-user-option-getter');
  // tslint:disable-next-line:variable-name
  const UserOptionPromptGetter = require('../../../../src/user-option/interactive/user-option-prompt-getter');

  return {prompts, UserOptions, IUserOptionGetter, UserOptionPromptGetter};
}

describe('Get User Options from User Interactive Input', () => {
  let originalPlatform;

  function prepareForTest(platform: string): TestDeps & { userOptionPromptGetter: IUserOptionGetterLib } {
    setPlatform(platform);
    const deps: TestDeps = getDeps();

    return {...deps, userOptionPromptGetter: jest.spyOn(deps.UserOptionPromptGetter, 'userOptionPromptGetter') as Mock};
  }

  async function testUserOptionPromptGetter<TUserOptions>(userOptionPromptGetter: IUserOptionGetterLib, expectedUserOptions: TUserOptions) {
    expect(userOptionPromptGetter).toHaveBeenCalledTimes(0);
    const pr = userOptionPromptGetter();
    expect(userOptionPromptGetter).toHaveBeenCalledTimes(1);
    expect(userOptionPromptGetter).toBeCalledWith();
    await expect(pr).toResolve();

    const userOptions = await pr;
    expect(userOptions).toEqual(expectedUserOptions);
    (userOptionPromptGetter as Mock).mockRestore();
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
    const {userOptionPromptGetter} = require('../../../../src/user-option/interactive/user-option-prompt-getter');
    expect(userOptionPromptGetter).toBeDefined();
  });

  describe('should get provided storage path and default values for destPublishScriptFilePath npmPublishOptions.registry', () => {

    function testForPlatform({platform, storagePath, destPublishScriptFilePath}) {
      it(`test for ${platform}`, async () => {
        const {UserOptions, prompts, userOptionPromptGetter} = prepareForTest(platform);
        const expectedUserOptions: typeof UserOptions = {
          storagePath,
          destPublishScriptFilePath,
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
        await testUserOptionPromptGetter<typeof UserOptions>(userOptionPromptGetter, expectedUserOptions);
      });
    }

    const platformsData = [
      {
        platform: 'win32',
        storagePath: 'C://storage-to-publish',
        destPublishScriptFilePath: './publish.bat',
      },
      {
        platform: 'linux',
        storagePath: '/home/user/storage-to-publish',
        destPublishScriptFilePath: './publish.sh',
      },
    ];

    platformsData.map(platform => testForPlatform(platform));
  });

  describe('should get provided storage path and publish script file path with default value for npmPublishOptions.registry', () => {

    function testForPlatform({platform, storagePath, destPublishScriptFilePath}) {
      it(`test for ${platform}`, async () => {
        const {UserOptions, prompts, userOptionPromptGetter} = prepareForTest(platform);
        const expectedUserOptions: typeof UserOptions = {
          storagePath,
          destPublishScriptFilePath,
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
        await testUserOptionPromptGetter<typeof UserOptions>(userOptionPromptGetter, expectedUserOptions);
      });
    }

    const platformsData = [
      {
        platform: 'win32',
        storagePath: 'C://storage-to-publish',
        destPublishScriptFilePath: './my-custom-publish-script.cmd',
      },
      {
        platform: 'linux',
        storagePath: '/home/user/storage-to-publish',
        destPublishScriptFilePath: './my-custom-publish-script.sh',
      },
    ];

    platformsData.map(platform => testForPlatform(platform));
  });

  describe('should get provided storage path, publish script file path and npmPublishOptions.registry', () => {

    function testForPlatform({platform, storagePath, destPublishScriptFilePath, registry}) {
      it(`test for ${platform}`, async () => {
        const {UserOptions, prompts, userOptionPromptGetter} = prepareForTest(platform);
        const expectedUserOptions: typeof UserOptions = {
          storagePath,
          destPublishScriptFilePath,
          npmPublishOptions: {
            registry
          },
          onlyNew: {
            enable: false,
            currentStoragePath: undefined
          }
        };

        // Inject the values
        prompts.inject([expectedUserOptions.storagePath, expectedUserOptions.destPublishScriptFilePath, expectedUserOptions?.npmPublishOptions?.registry]);
        await testUserOptionPromptGetter<typeof UserOptions>(userOptionPromptGetter, expectedUserOptions);
      });
    }

    const platformsData = [
      {
        platform: 'win32',
        storagePath: 'C://storage-to-publish',
        destPublishScriptFilePath: './my-custom-publish-script.cmd',
        registry: 'http://localhost:4873'
      },
      {
        platform: 'linux',
        storagePath: '/home/user/storage-to-publish',
        destPublishScriptFilePath: './my-custom-publish-script.sh',
        registry: 'http://localhost:4873'
      },
    ];

    platformsData.map(platform => testForPlatform(platform));
  });

  describe('should get the full user options that passed', () => {

    function testForPlatform(platform, userOptions: UserOptionsLib) {
      it(`test for ${platform}`, async () => {
        const {UserOptions, prompts, userOptionPromptGetter} = prepareForTest(platform);
        const expectedUserOptions: typeof UserOptions = userOptions;

        // Inject the values
        prompts.inject([
          expectedUserOptions.storagePath,
          expectedUserOptions.destPublishScriptFilePath,
          expectedUserOptions?.npmPublishOptions?.registry,
          expectedUserOptions?.onlyNew?.enable,
          expectedUserOptions?.onlyNew?.currentStoragePath
        ]);
        await testUserOptionPromptGetter<typeof UserOptions>(userOptionPromptGetter, expectedUserOptions);
      });
    }

    const platformsData: [string, UserOptionsLib][] = [
      ['win32', {
        storagePath: 'C://storage-to-publish',
        destPublishScriptFilePath: './my-publish-script.bat',
        npmPublishOptions: {
          registry: 'http://localhost:4873'
        },
        onlyNew: {
          enable: true,
          currentStoragePath: '.C://Users/user/storage'
        }
      }],
      ['linux', {
        storagePath: '/home/user/storage-to-publish',
        destPublishScriptFilePath: './my-custom-publish-script.sh',
        npmPublishOptions: {
          registry: 'http://localhost:4873'
        },
        onlyNew: {
          enable: true,
          currentStoragePath: '/root/curr-storage'
        }
      }]
    ];

    platformsData.map(([platform, userOption]) => testForPlatform(platform, userOption));
  });

  describe('should throw error that said `Canceled` when exiting before finish', () => {

    function testForPlatform(platform) {
      it(`test for ${platform}`, async () => {
        const {prompts, userOptionPromptGetter} = prepareForTest(platform);
        // Inject simulated user abort
        prompts.inject([new Error('simulate cancel')]);

        expect(userOptionPromptGetter).toHaveBeenCalledTimes(0);
        const pr = userOptionPromptGetter();
        expect(userOptionPromptGetter).toHaveBeenCalledTimes(1);
        expect(userOptionPromptGetter).toBeCalledWith();
        await expect(pr).toReject();

        (userOptionPromptGetter as Mock).mockRestore();
        const rejectResult = await pr.catch((e) => e);
        expect(rejectResult).toBeDefined();
        expect(rejectResult).toBeInstanceOf(Error);
        expect(rejectResult).toHaveProperty('message', 'Cancelled');
      });
    }

    const platforms = ['win32', 'linux'];

    platforms.map(platform => testForPlatform(platform));
  });
});
