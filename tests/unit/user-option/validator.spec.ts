import 'jest-extended';

jest.mock('../../../src/fs-utils');
import {UserOptions} from '../../../src/user-option/user-options';
import {
  validateUserOptions,
} from '../../../src/user-option/validator';
import type * as validator from '../../../src/user-option/validator';
import * as fsUtils from '../../../src/fs-utils';


describe('Validator', () => {

  describe('#validateUserOptions', () => {

    it('should return true if the user options contain existing storage path and valid values', async () => {
      // Arrange
      const userOptions: UserOptions = {
        storagePath: './storage',
        destPublishScriptFilePath: './publish.bat',
      };

      (fsUtils as jest.Mocked<typeof fsUtils>).isDirectoryExists.mockResolvedValue(true);

      // Act
      const isUserOptionsValid = validateUserOptions(userOptions);

      // Assert
      await expect(isUserOptionsValid).resolves.toBe(true);
    });

    it('should return false if the user options is undefined', async () => {
      // @ts-expect-error
      await expect(validateUserOptions(undefined)).resolves.toBe(false);
    });

    it('should return false if the user options is empty object', async () => {
      await expect(validateUserOptions({})).resolves.toBe(false);
    });

    it('should return false if the user options contain missing storage path', async () => {
      const userOptions: UserOptions = {
        storagePath: './storage',
        destPublishScriptFilePath: './publish.bat',
      };

      (fsUtils as jest.Mocked<typeof fsUtils>).isDirectoryExists.mockResolvedValue(false);

      await expect(validateUserOptions(userOptions)).resolves.toBe(false);
    });

    it('should return false if the user options.storagePath is empty string', async () => {
      const userOptions: UserOptions = {
        storagePath: '',
        destPublishScriptFilePath: './publish.bat',
      };

      await expect(validateUserOptions(userOptions)).resolves.toBe(false);
    });

    describe('should return false if one of the validation failed', () => {
      let mockedValidator: typeof validator = require('../../../src/user-option/validator');
      let _validateUserOptions: typeof validator.validateUserOptions;

      beforeAll(() => {
        jest.resetModules();
      });

      beforeEach(() => {
        mockedValidator = require('../../../src/user-option/validator');
        jest.mock('../../../src/user-option/validator');
        _validateUserOptions =  jest.requireActual('../../../src/user-option/validator').validateUserOptions;
      });

      afterEach(() => {
        jest.resetModules();
      });

      it.each([
        ['validateStorage'],
        ['validateDestPublishScriptFilePath'],
        ['validateNpmPublishOptionsIfSpecified'],
        ['validateOnlyNewOptionsIfSpecified'],
      ])('should return false if `%s` return false', async (functionName) => {
        // Arrange
        mockedValidator[functionName].mockResolvedValueOnce(false);

        // Act
        const isValid = _validateUserOptions({});

        // Assert
        await expect(isValid).resolves.toBe(false);
      });
    });

  });
});
