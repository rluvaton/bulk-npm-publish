import 'jest-extended';

import { IUserOptionGetter as IUserOptionGetterLib } from '../../i-user-option-getter';
import { UserOptions as UserOptionsLib } from '../../user-options';
import { setPlatform } from '../../../../tests/util';
import Mock = jest.Mock;

interface TestDeps {
  prompts: any;
  UserOptions: UserOptionsLib;
  IUserOptionGetter: IUserOptionGetterLib;
  UserOptionPromptGetter: { userOptionPromptGetter: IUserOptionGetterLib };
  userOptionPromptGetter?: IUserOptionGetterLib;
}

function getDeps(): TestDeps {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const prompts = require('prompts');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { UserOptions } = require('../../user-options');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { IUserOptionGetter } = require('../../i-user-option-getter');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const UserOptionPromptGetter = require('./');

  return { prompts, UserOptions, IUserOptionGetter, UserOptionPromptGetter };
}

describe('Get User Options from User Interactive Input', () => {
  let originalPlatform;

  function prepareForTest(platform: string): TestDeps & { userOptionPromptGetter: IUserOptionGetterLib } {
    setPlatform(platform);
    const deps: TestDeps = getDeps();

    return {
      ...deps,
      userOptionPromptGetter: jest.spyOn(deps.UserOptionPromptGetter, 'userOptionPromptGetter') as Mock,
    };
  }

  async function testUserOptionPromptGetter<TUserOptions>(
    userOptionPromptGetter: IUserOptionGetterLib,
    expectedUserOptions: TUserOptions,
  ) {
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

  describe('should get provided storage path and default values for destPublishScriptFilePath npmPublishOptions.registry', () => {
    it.each([
      ['win32', 'C://storage-to-publish', './publish.bat'],
      ['linux', '/home/user/storage-to-publish', './publish.sh'],
    ])(`test for %s`, async (platform, storagePath, destPublishScriptFilePath) => {
      const { UserOptions, prompts, userOptionPromptGetter } = prepareForTest(platform);
      const expectedUserOptions: typeof UserOptions = {
        storagePath,
        destPublishScriptFilePath,
        npmPublishOptions: {
          registry: undefined,
        },
        onlyNew: {
          enable: false,
          registry: undefined,
        },
      };

      // Inject the values
      prompts.inject([expectedUserOptions.storagePath, undefined, undefined]);
      await testUserOptionPromptGetter<typeof UserOptions>(userOptionPromptGetter, expectedUserOptions);
    });
  });

  describe('should get provided storage path and publish script file path with default value for npmPublishOptions.registry', () => {
    it.each([
      ['win32', 'C://storage-to-publish', './my-custom-publish-script.cmd'],
      ['linux', '/home/user/storage-to-publish', './my-custom-publish-script.sh'],
    ])(`test for %s`, async (platform, storagePath, destPublishScriptFilePath) => {
      const { UserOptions, prompts, userOptionPromptGetter } = prepareForTest(platform);
      const expectedUserOptions: typeof UserOptions = {
        storagePath,
        destPublishScriptFilePath,
        npmPublishOptions: {
          registry: undefined,
        },
        onlyNew: {
          enable: false,
          registry: undefined,
        },
      };

      // Inject the values
      prompts.inject([expectedUserOptions.storagePath, expectedUserOptions.destPublishScriptFilePath, undefined]);
      await testUserOptionPromptGetter<typeof UserOptions>(userOptionPromptGetter, expectedUserOptions);
    });
  });

  describe('should get provided storage path, publish script file path and npmPublishOptions.registry', () => {
    it.each([
      ['win32', 'C://storage-to-publish', './my-custom-publish-script.cmd', 'http://localhost:4873'],
      ['linux', '/home/user/storage-to-publish', './my-custom-publish-script.sh', 'http://localhost:4873'],
    ])(`test for %s`, async (platform, storagePath, destPublishScriptFilePath, registry) => {
      const { UserOptions, prompts, userOptionPromptGetter } = prepareForTest(platform);
      const expectedUserOptions: typeof UserOptions = {
        storagePath,
        destPublishScriptFilePath,
        npmPublishOptions: {
          registry,
        },
        onlyNew: {
          enable: false,
          registry: undefined,
        },
      };

      // Inject the values
      prompts.inject([
        expectedUserOptions.storagePath,
        expectedUserOptions.destPublishScriptFilePath,
        expectedUserOptions?.npmPublishOptions?.registry,
      ]);
      await testUserOptionPromptGetter<typeof UserOptions>(userOptionPromptGetter, expectedUserOptions);
    });
  });

  describe('should get the full user options that passed', () => {
    const platformsData: [string, UserOptionsLib][] = [
      [
        'win32',
        {
          storagePath: 'C://storage-to-publish',
          destPublishScriptFilePath: './my-publish-script.bat',
          npmPublishOptions: {
            registry: 'http://localhost:4873',
          },
          onlyNew: {
            enable: true,
            registry: 'http://localhost:4873',
          },
        },
      ],
      [
        'linux',
        {
          storagePath: '/home/user/storage-to-publish',
          destPublishScriptFilePath: './my-custom-publish-script.sh',
          npmPublishOptions: {
            registry: 'http://localhost:4873',
          },
          onlyNew: {
            enable: true,
            registry: 'http://localhost:4873',
          },
        },
      ],
    ];
    it.each(platformsData)(`test for %s`, async (platform, userOptions: UserOptionsLib) => {
      const { UserOptions, prompts, userOptionPromptGetter } = prepareForTest(platform);
      const expectedUserOptions: typeof UserOptions = userOptions;

      // Inject the values
      prompts.inject([
        expectedUserOptions.storagePath,
        expectedUserOptions.destPublishScriptFilePath,
        expectedUserOptions?.npmPublishOptions?.registry,
        expectedUserOptions?.onlyNew?.enable,
        expectedUserOptions?.onlyNew?.registry,
      ]);
      await testUserOptionPromptGetter<typeof UserOptions>(userOptionPromptGetter, expectedUserOptions);
    });
  });

  describe('should throw error that said `Canceled` when exiting before finish', () => {
    it.each(['win32', 'linux'])(`test for %s`, async (platform) => {
      const { prompts, userOptionPromptGetter } = prepareForTest(platform);
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
  });
});
