import 'jest-extended';

jest.mock('../../../src/fs-utils');
import {UserOptions} from '../../../src/user-option/user-options';

import type * as _validator from '../../../src/user-option/validator';
import * as fsUtils from '../../../src/fs-utils';
import MockedFunction = jest.MockedFunction;


describe('Validator', () => {

  describe('#validateUserOptions', () => {

    let validator: typeof _validator;
    let validateUserOptions: typeof _validator.validateUserOptions;

    beforeEach(() => {
      validator = require('../../../src/user-option/validator');
      jest.mock('../../../src/user-option/validator');
      validateUserOptions = jest.requireActual('../../../src/user-option/validator').validateUserOptions;
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should be defined', () => {
      expect(validateUserOptions).toBeDefined();
    });

    it('should return true if the user options contain existing storage path and destPublishScriptFilePath', async () => {
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

    it('should return false if the user options.npmPublishOptions.registry is an empty string', async () => {
      // Arrange
      const userOptions: UserOptions = {
        storagePath: './storage',
        destPublishScriptFilePath: './publish.bat',
        npmPublishOptions: {
          registry: ''
        }
      };

      // Act
      const isValid = validateUserOptions(userOptions);

      // Assert
      await expect(isValid).resolves.toBe(false);
    });

    it('should return false if the user options.npmPublishOptions.registry is not a url', async () => {
      // Arrange
      const userOptions: UserOptions = {
        storagePath: './storage',
        destPublishScriptFilePath: './publish.bat',
        npmPublishOptions: {
          registry: 'hello'
        }
      };

      // Act
      const isValid = validateUserOptions(userOptions);

      // Assert
      await expect(isValid).resolves.toBe(false);
    });

    // tslint:disable-next-line:max-line-length
    it('should return true if `validateStorage`, `validateDestPublishScriptFilePath`, `validateNpmPublishOptionsIfSpecified` and `validateOnlyNewOptionsIfSpecified` return true', async () => {
      // Arrange
      (validator.validateStorage as MockedFunction<typeof validator.validateStorage>).mockImplementation(async () => {
        return true;
      });
      (validator.validateDestPublishScriptFilePath as MockedFunction<typeof validator.validateDestPublishScriptFilePath>).mockImplementation(async () => {
        return true;
      });
      (validator.validateNpmPublishOptionsIfSpecified as MockedFunction<typeof validator.validateNpmPublishOptionsIfSpecified>).mockImplementation(async () => {
        return true;
      });
      (validator.validateOnlyNewOptionsIfSpecified as MockedFunction<typeof validator.validateOnlyNewOptionsIfSpecified>).mockImplementation(async () => {
        return true;
      });

      // Act

      const isValid = validateUserOptions({});

      // Assert
      await expect(isValid).resolves.toBe(true);
    });

    describe('should return false if one of the validation failed', () => {

      it.each([
        ['validateStorage'],
        ['validateDestPublishScriptFilePath'],
        ['validateNpmPublishOptionsIfSpecified'],
        ['validateOnlyNewOptionsIfSpecified'],
      ])('should return false if `%s` return false', async (functionName) => {
        // Arrange
        validator[functionName].mockResolvedValueOnce(false);

        // Act
        const isValid = validateUserOptions({});

        // Assert
        await expect(isValid).resolves.toBe(false);
      });

    });

  });

  describe('#validateStorage', () => {

    let validator: typeof _validator;
    let validateStorage: typeof _validator.validateStorage;

    beforeEach(() => {
      validator = require('../../../src/user-option/validator');
      jest.mock('../../../src/user-option/validator');

      validateStorage = jest.requireActual('../../../src/user-option/validator').validateStorage;
    });

    it('should be defined', () => {
      expect(validateStorage).toBeDefined();
    });

    it('should return true when storage folder exists', async () => {
      // Arrange
      (fsUtils as jest.Mocked<typeof fsUtils>).isDirectoryExists.mockResolvedValueOnce(true);

      // Act
      const isStorageValid = validateStorage('./storage');

      // Assert
      await expect(isStorageValid).resolves.toBe(true);
    });

    it(`should return false when storage folder doesn't exist`, async () => {
      // Arrange
      (fsUtils as jest.Mocked<typeof fsUtils>).isDirectoryExists.mockResolvedValueOnce(false);

      // Act
      const isStorageValid = validateStorage('./storage');

      // Assert
      await expect(isStorageValid).resolves.toBe(false);
    });

    it(`should return false when passing undefined`, async () => {

      // Act
      const isStorageValid = validateStorage(undefined);

      // Assert
      await expect(isStorageValid).resolves.toBe(false);
    });
  });
});
