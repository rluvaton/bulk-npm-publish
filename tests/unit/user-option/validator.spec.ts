import 'jest-extended';

import {UserOptions} from '../../../src/user-option/user-options';
import * as validator from '../../../src/user-option/validator';
import * as fsUtils from '../../../src/fs-utils';

describe('Validator', () => {

  describe('#validateUserOptions', () => {

    it('should be defined', () => {
      expect(validator.validateUserOptions).toBeDefined();
    });

    it('should return true if the user options contain existing storage path and destPublishScriptFilePath', async () => {
      // Arrange
      const userOptions: UserOptions = {
        storagePath: './storage',
        destPublishScriptFilePath: './publish.bat',
      };

      jest.spyOn(fsUtils, 'isDirectoryExists').mockResolvedValue(true);

      // Act
      const isUserOptionsValid = validator.validateUserOptions(userOptions);

      // Assert
      await expect(isUserOptionsValid).resolves.toBe(true);
    });

    it('should return false if the user options is undefined', async () => {
      // @ts-expect-error
      await expect(validator.validateUserOptions(undefined)).resolves.toBe(false);
    });

    it('should return false if the user options is empty object', async () => {
      await expect(validator.validateUserOptions({})).resolves.toBe(false);
    });

    it('should return false if the user options contain missing storage path', async () => {
      const userOptions: UserOptions = {
        storagePath: './storage',
        destPublishScriptFilePath: './publish.bat',
      };

      jest.spyOn(fsUtils, 'isDirectoryExists').mockResolvedValue(false);

      await expect(validator.validateUserOptions(userOptions)).resolves.toBe(false);
    });

    it('should return false if the user options.storagePath is empty string', async () => {
      const userOptions: UserOptions = {
        storagePath: '',
        destPublishScriptFilePath: './publish.bat',
      };

      await expect(validator.validateUserOptions(userOptions)).resolves.toBe(false);
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
      const isValid = validator.validateUserOptions(userOptions);

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
      const isValid = validator.validateUserOptions(userOptions);

      // Assert
      await expect(isValid).resolves.toBe(false);
    });

    // tslint:disable-next-line:max-line-length
    it('should return true if `validateStorage`, `validateDestPublishScriptFilePath`, `validateNpmPublishOptionsIfSpecified` and `validateOnlyNewOptionsIfSpecified` return true', async () => {
      // Arrange
      jest.spyOn(validator, 'validateStorage').mockResolvedValue(true);
      jest.spyOn(validator, 'validateDestPublishScriptFilePath').mockResolvedValue(true);
      jest.spyOn(validator, 'validateNpmPublishOptionsIfSpecified').mockResolvedValue(true);
      jest.spyOn(validator, 'validateOnlyNewOptionsIfSpecified').mockResolvedValue(true);

      // Act

      const isValid = validator.validateUserOptions({});

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
        // @ts-ignore
        jest.spyOn(validator, functionName).mockResolvedValue(false);

        // Act
        const isValid = validator.validateUserOptions({});

        // Assert
        await expect(isValid).resolves.toBe(false);
      });

    });

  });

  describe('#validateStorage', () => {

    it('should be defined', () => {
      expect(validator.validateStorage).toBeDefined();
    });

    it('should return true when storage folder exists', async () => {
      // Arrange
      jest.spyOn(fsUtils, 'isDirectoryExists').mockResolvedValue(true);

      // Act
      const isStorageValid = validator.validateStorage('./storage');

      // Assert
      await expect(isStorageValid).resolves.toBe(true);
    });

    it(`should return false when storage folder doesn't exist`, async () => {
      // Arrange
      jest.spyOn(fsUtils, 'isDirectoryExists').mockResolvedValue(false);

      // Act
      const isStorageValid = validator.validateStorage('./storage');

      // Assert
      await expect(isStorageValid).resolves.toBe(false);
    });

    it.each([
      ['/tmp/../', 'Linux'],
      ['C:\\Users\\..\\', 'Windows'],

      ['../', 'Linux'],
      ['..\\', 'Windows'],


      ['/tmp/../.', 'Linux'],
      ['C:\\Users\\..\\.', 'Windows'],

      ['../.', 'Linux'],
      ['..\\.', 'Windows'],

      ['/tmp/storage', 'Linux'],
      ['C:\\storage', 'Windows'],

      ['../storage', 'Linux'],
      ['..\\storage', 'Windows'],

      ['/tmp/storage/', 'Linux'],
      ['C:\\storage\\', 'Windows'],

      ['../storage/', 'Linux'],
      ['..\\storage\\', 'Windows'],

      ['/some dir with spaces/storage', 'Linux'],
      ['C:\\some dir with spaces\\storage', 'Windows'],

      ['../some dir with spaces/storage', 'Linux'],
      ['..\\some dir with spaces\\storage', 'Windows'],

      ['/some dir with spaces/storage/', 'Linux'],
      ['C:\\some dir with spaces\\storage\\', 'Windows'],

      ['../some dir with spaces/storage/', 'Linux'],
      ['..\\some dir with spaces\\storage\\', 'Windows'],
    ])('should return true when storage path is %s like in %s', async (destPublishScriptFilePath, _osTypePath) => {
      // Arrange
      jest.spyOn(fsUtils, 'isDirectoryExists').mockResolvedValue(true);

      // Act
      const isStorageValid = validator.validateStorage(destPublishScriptFilePath);

      // Assert
      await expect(isStorageValid).resolves.toBe(true);
    });

    it(`should return false when passing undefined`, async () => {

      // Act
      const isStorageValid = validator.validateStorage();

      // Assert
      await expect(isStorageValid).resolves.toBe(false);
    });
  });

  describe('#validateDestPublishScriptFilePath', () => {

    it('should be defined', () => {
      expect(validator.validateDestPublishScriptFilePath).toBeDefined();
    });

    it.each([
      ['../someDir/publish.sh', 'Linux'],
      ['..\\someDir\\publish.bat', 'Windows'],

      ['Linux', '../someDir/.sh'],
      ['Windows', '..\\someDir\\.bat'],

      ['Linux', '../someDir/publish'],
      ['Windows', '..\\someDir\\publish'],

      ['Linux', '../'],
      ['Windows', '..\\'],

      ['Linux', '/publish.sh'],
      ['Windows', 'C:\\publish.bat'],
    ])('should return true when the dest publish script file path is %s like in %s', async (destPublishScriptFilePath, _osTypePath) => {
      // Arrange
      jest.spyOn(fsUtils, 'isDirectoryExists').mockResolvedValue(true);

      // Act
      const isDestPublishScriptFilePathValid = validator.validateDestPublishScriptFilePath(destPublishScriptFilePath);

      // Assert
      await expect(isDestPublishScriptFilePathValid).resolves.toBe(true);
    });


    it.each([
      ['Linux', '/tmp/'],
      ['Windows', 'C:\\Program Files\\'],
    ])('should return false the dest publish script file path pointing to a absolute directory in %s', async (osTypePath, destPublishScriptFilePath) => {
      // Arrange
      jest.spyOn(fsUtils, 'isDirectoryExists').mockResolvedValue(true);

      // Act
      const isDestPublishScriptFilePathValid = validator.validateDestPublishScriptFilePath(destPublishScriptFilePath);

      // Assert
      await expect(isDestPublishScriptFilePathValid).resolves.toBe(false);
    });

    it(`should return false when passing undefined`, async () => {
      // Act
      const isDestPublishScriptFilePathValid = validator.validateDestPublishScriptFilePath();

      // Assert
      await expect(isDestPublishScriptFilePathValid).resolves.toBe(false);
    });

    it(`should return false when passing empty string`, async () => {

      // Act
      const isStorageValid = validator.validateDestPublishScriptFilePath('');

      // Assert
      await expect(isStorageValid).resolves.toBe(false);
    });
  });
});
