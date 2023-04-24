import 'jest-extended';

import { IUserOptionGetter as IUserOptionGetterLib } from '../../i-user-option-getter';
import { UserOptions as UserOptionsLib } from '../../user-options';
import { setPlatform } from '../../../../tests/util';
import Mock = jest.Mock;
import { UserOptionArgGetterResult } from './';

interface TestDeps {
  UserOptions: UserOptionsLib;
  IUserOptionGetter: IUserOptionGetterLib;
  UserOptionGetter: { userOptionArgGetter: IUserOptionGetterLib };
  userOptionGetter?: IUserOptionGetterLib;
}

function getDeps(): TestDeps {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { UserOptions } = require('../../user-options');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { IUserOptionGetter } = require('../../i-user-option-getter');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const UserOptionGetter = require('./');

  return { UserOptions, IUserOptionGetter, UserOptionGetter };
}

describe('Get User Options from User Argument Input', () => {
  let originalPlatform;
  const AVAILABLE_PLATFORMS = ['win32', 'linux'];
  const AVAILABLE_PLATFORMS_FOR_EACH = AVAILABLE_PLATFORMS.map((p) => [p]);

  function prepareForTest(
    platform: string,
    injectArgs: string,
    { failFn, onYargsInstance }: { failFn?: any; onYargsInstance?: (yargs) => void },
  ): TestDeps & { userOptionGetter: IUserOptionGetterLib } {
    setPlatform(platform);

    // Mock Yargs (Make it be called with custom args)
    jest.mock('yargs', () => {
      const yargs = jest.requireActual('yargs');

      let $yargs = yargs(injectArgs);

      // Prevent process exit
      $yargs = $yargs.exitProcess(false);

      if (failFn !== undefined) {
        $yargs = $yargs.fail(failFn);
      }

      if (onYargsInstance !== undefined) {
        onYargsInstance($yargs);
      }

      return $yargs;
    });

    const deps: TestDeps = getDeps();

    return {
      ...deps,
      userOptionGetter: jest.spyOn(deps.UserOptionGetter, 'userOptionArgGetter') as Mock,
    };
  }

  async function testUserOptionGetter(userOptionGetter: IUserOptionGetterLib): Promise<UserOptionArgGetterResult> {
    expect(userOptionGetter).toHaveBeenCalledTimes(0);
    const promiseResult = userOptionGetter();
    expect(userOptionGetter).toHaveBeenCalledTimes(1);
    expect(userOptionGetter).toBeCalledWith();
    return promiseResult;
  }

  /**
   * Helper Tests functions
   */

  const getYargs = (onYargsInstanceFn) => {
    expect(onYargsInstanceFn.mock.calls).toBeArrayOfSize(1);
    expect(onYargsInstanceFn.mock.calls[0]).toBeArrayOfSize(1);
    return onYargsInstanceFn.mock.calls[0][0];
  };

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
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { userOptionArgGetter } = require('./');
    expect(userOptionArgGetter).toBeDefined();
  });

  describe('should fail when no args are passing', () => {
    test.each(AVAILABLE_PLATFORMS_FOR_EACH)(`test for %s`, async (platform) => {
      const onFailFn = jest.fn();

      // We aren't checking for error logging because we pass `onFailFn` which instead of output an error it will call this function
      const { userOptionGetter } = prepareForTest(platform, '', {
        failFn: onFailFn,
      });

      expect(onFailFn).toHaveBeenCalledTimes(0);
      await testUserOptionGetter(userOptionGetter);
      expect(onFailFn.mock.calls).toBeArrayOfSize(1);
      expect(onFailFn.mock.calls[0]).toBeArrayOfSize(3);
      expect(onFailFn.mock.calls[0][0]).toEqual(
        'You must pass either -i (interactive input) or --sp (storage path, for args pass)',
      );

      (userOptionGetter as Mock).mockRestore();
    });
  });

  describe('should output help to console', () => {
    const getHelpText = (_yargs): string => {
      const getHelpFn = jest.fn();

      _yargs.showHelp(getHelpFn);

      expect(getHelpFn.mock.calls).toBeArrayOfSize(1);
      expect(getHelpFn.mock.calls[0]).toBeArrayOfSize(1);

      return getHelpFn.mock.calls[0][0];
    };

    describe.each([['-h'], ['--help']])(`when passing %s`, (alias) => {
      test.each(AVAILABLE_PLATFORMS_FOR_EACH)(`test for %s`, async (platform) => {
        const consoleSpy = jest.spyOn(console, 'log');

        // Disable output
        consoleSpy.mockImplementation(() => {
          // NoOp
        });

        const onFailFn = jest.fn();
        const onYargsInstanceFn = jest.fn();

        const { userOptionGetter } = prepareForTest(platform, alias, {
          failFn: onFailFn,
          onYargsInstance: onYargsInstanceFn,
        });

        await testUserOptionGetter(userOptionGetter);

        // Check that test hasn't failed
        expect(onFailFn.mock.calls).toBeArrayOfSize(0);

        const yargs = getYargs(onYargsInstanceFn);
        const helpText = getHelpText(yargs);

        expect(consoleSpy).toHaveBeenCalledWith(helpText);

        (userOptionGetter as Mock).mockRestore();
        consoleSpy.mockRestore();
      });
    });
  });

  describe('should return interactive=true when passing one of the interactive aliases', () => {
    describe.each([['-i'], ['--interactive']])(`when passing %s`, (alias) => {
      test.each(AVAILABLE_PLATFORMS_FOR_EACH)(`test for %s`, async (platform) => {
        const onFailFn = jest.fn();
        const onYargsInstanceFn = jest.fn();

        const { userOptionGetter } = prepareForTest(platform, alias, {
          failFn: onFailFn,
          onYargsInstance: onYargsInstanceFn,
        });

        await expect(testUserOptionGetter(userOptionGetter)).resolves.toEqual<UserOptionArgGetterResult>({
          interactive: true,
        });

        // Check that test hasn't failed
        expect(onFailFn.mock.calls).toBeArrayOfSize(0);

        (userOptionGetter as Mock).mockRestore();
      });
    });
  });

  describe('storagePath', () => {
    describe('should return the userOptions object with only the storagePath', () => {
      describe.each([
        ['--sp', '~/storage'],
        ['--storage-path', '~/storage'],
      ])(`when passing %s`, (alias, storagePath) => {
        test.each(AVAILABLE_PLATFORMS_FOR_EACH)(`test for %s`, async (platform) => {
          const onFailFn = jest.fn();
          const onYargsInstanceFn = jest.fn();

          const { userOptionGetter } = prepareForTest(platform, `${alias} ${storagePath}`, {
            failFn: onFailFn,
            onYargsInstance: onYargsInstanceFn,
          });

          await expect(testUserOptionGetter(userOptionGetter)).resolves.toEqual<UserOptionArgGetterResult>({
            storagePath: storagePath,
          });

          // Check that test hasn't failed
          expect(onFailFn.mock.calls).toBeArrayOfSize(0);

          (userOptionGetter as Mock).mockRestore();
        });
      });
    });

    describe('should fail when passing empty storage path', () => {
      describe.each([['--sp'], ['--storage-path']])(`when passing %s`, (alias) => {
        test.each(AVAILABLE_PLATFORMS_FOR_EACH)(`test for %s`, async (platform) => {
          const onYargsInstanceFn = jest.fn();

          const { userOptionGetter } = prepareForTest(platform, `${alias}  `, {
            failFn: false,
            onYargsInstance: onYargsInstanceFn,
          });

          const userOptionResultPr = testUserOptionGetter(userOptionGetter);

          // Assert
          await expect(userOptionResultPr).rejects.toThrow(`Not enough arguments following: ${alias.slice(2)}`);
          (userOptionGetter as Mock).mockRestore();
        });
      });
    });
  });

  describe('should fail when not passing one of the required arguments (h [help], i [interactive] and sp [storage path])', () => {
    describe.each([['-o ./custom-publish.sh'], ['-r http://localhost:4873'], ['--cs ~/new-storage']])(
      `when passing %s`,
      (args) => {
        test.each(AVAILABLE_PLATFORMS_FOR_EACH)(`test for %s`, async (platform) => {
          const onFailFn = jest.fn();
          const onYargsInstanceFn = jest.fn();

          const { userOptionGetter } = prepareForTest(platform, args, {
            failFn: onFailFn,
            onYargsInstance: onYargsInstanceFn,
          });

          await testUserOptionGetter(userOptionGetter);

          // Check that test failed
          expect(onFailFn.mock.calls).toBeArrayOfSize(1);
          expect(onFailFn.mock.calls[0]).toBeArrayOfSize(3);
          expect(onFailFn.mock.calls[0][0]).toEqual(
            `You must pass either -i (interactive input) or --sp (storage path, for args pass)`,
          );

          (userOptionGetter as Mock).mockRestore();
        });
      },
    );
  });

  describe('should return user options with the provided registry (and storage path) when passing one of the registry aliases', () => {
    describe.each([['-r'], ['--registry']])(`when passing %s`, (alias) => {
      test.each(AVAILABLE_PLATFORMS_FOR_EACH)(`test for %s`, async (platform) => {
        const onFailFn = jest.fn();
        const onYargsInstanceFn = jest.fn();
        const storagePath = '~/storage';
        const registry = 'http://localhost:4873';

        const { userOptionGetter } = prepareForTest(platform, `--sp ${storagePath} ${alias} ${registry}`, {
          failFn: onFailFn,
          onYargsInstance: onYargsInstanceFn,
        });

        await expect(testUserOptionGetter(userOptionGetter)).resolves.toEqual<UserOptionArgGetterResult>({
          storagePath,
          npmPublishOptions: {
            registry,
          },
        });

        // Check that test hasn't failed
        expect(onFailFn.mock.calls).toBeArrayOfSize(0);

        (userOptionGetter as Mock).mockRestore();
      });
    });
  });

  describe('should return user options with the remote registry (and storage path) when passing one of the remote registry aliases', () => {
    describe.each([['--rg'], ['--remote-registry']])(`when passing %s`, (alias) => {
      test.each(AVAILABLE_PLATFORMS_FOR_EACH)(`test for %s`, async (platform) => {
        const onFailFn = jest.fn();
        const onYargsInstanceFn = jest.fn();
        const storagePath = '~/storage';
        const registry = 'http://localhost:4873';

        const { userOptionGetter } = prepareForTest(platform, `--sp ${storagePath} ${alias} ${registry}`, {
          failFn: onFailFn,
          onYargsInstance: onYargsInstanceFn,
        });

        await expect(testUserOptionGetter(userOptionGetter)).resolves.toEqual<UserOptionArgGetterResult>({
          storagePath,
          onlyNew: {
            enable: true,
            registry,
          },
        });

        // Check that test hasn't failed
        expect(onFailFn.mock.calls).toBeArrayOfSize(0);

        (userOptionGetter as Mock).mockRestore();
      });
    });
  });
});
