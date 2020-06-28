import 'jest-extended';

import {IUserOptionGetter as IUserOptionGetterLib} from '../../../../src/user-option/i-user-option-getter';
import {UserOptions as UserOptionsLib} from '../../../../src/user-option/user-options';
import {setPlatform} from '../../../util';
import Mock = jest.Mock;

interface TestDeps {
  UserOptions: UserOptionsLib;
  IUserOptionGetter: IUserOptionGetterLib;
  UserOptionGetter: { userOptionArgGetter: IUserOptionGetterLib };
  userOptionGetter?: IUserOptionGetterLib;
}

function getDeps(): TestDeps {
  const {UserOptions} = require('../../../../src/user-option/user-options');
  const {IUserOptionGetter} = require('../../../../src/user-option/i-user-option-getter');
  // tslint:disable-next-line:variable-name
  const UserOptionGetter = require('../../../../src/user-option/args/');

  return {UserOptions, IUserOptionGetter, UserOptionGetter};
}

describe('Get User Options from User Argument Input', () => {
  let originalPlatform;
  const AVAILABLE_PLATFORMS = ['win32', 'linux'];

  function prepareForTest(platform: string,
                          injectArgs: string,
                          {failFn, onYargsInstance}: { failFn?: any, onYargsInstance?: (yargs) => void }
  ): TestDeps & { userOptionGetter: IUserOptionGetterLib } {
    setPlatform(platform);

    // Mock Yargs (Make it be called with custom args)
    jest.mock('yargs', () => {
      const yargs = jest.requireActual('yargs');

      let $yargs = yargs(injectArgs);

      // Prevent process exit
      $yargs = $yargs.exitProcess(false);

      if (failFn) {
        $yargs = $yargs.fail(failFn);
      }

      if (onYargsInstance) {
        onYargsInstance($yargs);
      }

      return $yargs;
    });

    const deps: TestDeps = getDeps();

    return {...deps, userOptionGetter: jest.spyOn(deps.UserOptionGetter, 'userOptionArgGetter') as Mock};
  }

  async function testUserOptionGetter<TUserOptions>(userOptionGetter: IUserOptionGetterLib): Promise<UserOptionsLib> {
    expect(userOptionGetter).toHaveBeenCalledTimes(0);
    const promiseResult = userOptionGetter();
    expect(userOptionGetter).toHaveBeenCalledTimes(1);
    expect(userOptionGetter).toBeCalledWith();
    return promiseResult;
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
    const {userOptionArgGetter} = require('../../../../src/user-option/args/');
    expect(userOptionArgGetter).toBeDefined();
  });

  describe('should fail when no args are passing', () => {
    const testForPlatform = platform => {
      it(`test for ${platform}`, async () => {
        const onFailFn = jest.fn();

        // We aren't checking for error logging because we pass `onFailFn` which instead of output an error it will call this function
        const {userOptionGetter} = prepareForTest(platform, '', {failFn: onFailFn});

        expect(onFailFn).toHaveBeenCalledTimes(0);
        await testUserOptionGetter(userOptionGetter);
        expect(onFailFn.mock.calls).toBeArrayOfSize(1);
        expect(onFailFn.mock.calls[0]).toBeArrayOfSize(3);
        expect(onFailFn.mock.calls[0][0]).toEqual('You must pass either -i (interactive input) or -sp (storage path, for args pass)');

        (userOptionGetter as Mock).mockRestore();
      });
    };

    AVAILABLE_PLATFORMS.forEach(testForPlatform);
  });

  describe('should output help to console', () => {

    const testHelpAlias = (helpAlias: string) => {
      describe(`when passing ${helpAlias}`, () => {
        const testForPlatform = platform => {
          it(`test for ${platform}`, async () => {
            const consoleSpy = jest.spyOn(console, 'log');

            // Disable output
            consoleSpy.mockImplementation(() => {
            });

            const onFailFn = jest.fn();
            const onYargsInstanceFn = jest.fn();

            const getYargs = () => {
              expect(onYargsInstanceFn.mock.calls).toBeArrayOfSize(1);
              expect(onYargsInstanceFn.mock.calls[0]).toBeArrayOfSize(1);
              return onYargsInstanceFn.mock.calls[0][0];
            };

            const getHelpText = (): string => {
              const getHelpFn = jest.fn();

              yargs.showHelp(getHelpFn);

              expect(getHelpFn.mock.calls).toBeArrayOfSize(1);
              expect(getHelpFn.mock.calls[0]).toBeArrayOfSize(1);

              return getHelpFn.mock.calls[0][0];
            };

            const {userOptionGetter} = prepareForTest(platform, helpAlias, {failFn: onFailFn, onYargsInstance: onYargsInstanceFn});

            await testUserOptionGetter(userOptionGetter);

            // Check that test haven't failed
            expect(onFailFn.mock.calls).toBeArrayOfSize(0);

            const yargs = getYargs();
            const helpText = getHelpText();

            expect(consoleSpy).toHaveBeenCalledWith(helpText);

            (userOptionGetter as Mock).mockRestore();
            consoleSpy.mockRestore();
          });
        };

        AVAILABLE_PLATFORMS.forEach(platform => testForPlatform(platform));
      });
    };

    ['-h', '--help'].forEach(testHelpAlias);
  });
});
