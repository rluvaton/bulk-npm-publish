import 'jest-extended';
import {when, verifyAllWhenMocksCalled, resetAllWhenMocks} from 'jest-when';

import {dirname} from 'path';
import {UserOptions} from '../../../src/user-option/user-options';
import * as validator from '../../../src/user-option/validator';
import * as fsUtils from '../../../src/fs-utils';
import * as npmUtils from '../../../src/npm-utils';

describe('User Options Validator', () => {

  afterEach(() => {
    resetAllWhenMocks();
  });

  describe('Validate User Options', () => {

    const setValidStoragePathAndDestPublishScriptFilePath = (userOptions: UserOptions) => {
      const spiedIsDirectoryExists = jest.spyOn(fsUtils, 'isDirectoryExists');

      when(spiedIsDirectoryExists)
        .calledWith(userOptions.storagePath).mockResolvedValue(true)
        .calledWith(userOptions.destPublishScriptFilePath).mockResolvedValue(false)
        .calledWith(dirname(userOptions.destPublishScriptFilePath)).mockResolvedValue(true);
    };

    it('should be defined', () => {
      expect(validator.validateUserOptions).toBeDefined();
    });

    it(`should reject with 'Missing Path' Error if the user options is undefined`, async () => {
      // Arrange
      const missingPathError = new Error('Missing path');

      // Act
      // @ts-expect-error
      const isValid = validator.validateUserOptions(undefined);

      // Assert
      await expect(isValid).rejects.toThrowError(missingPathError);
    });

    it(`should reject with 'Missing Path' Error if the user options is empty object`, async () => {
      // Arrange
      const missingPathError = new Error('Missing path');

      // Act
      const isValid = validator.validateUserOptions({});

      // Assert
      await expect(isValid).rejects.toThrowError(missingPathError);
    });

    it('should return true if the user options contain existing storage path and non existing destPublishScriptFilePath path', async () => {
      // Arrange
      const userOptions: UserOptions = {
        storagePath: './storage',
        destPublishScriptFilePath: './publish.bat',
      };

      setValidStoragePathAndDestPublishScriptFilePath(userOptions);

      // Act
      const isUserOptionsValid = validator.validateUserOptions(userOptions);

      // Assert
      await expect(isUserOptionsValid).resolves.toBe(true);
    });

    it(`should reject with 'Directory does not exist' Error if the user options contain missing storage path`, async () => {
      // Arrange
      const userOptions: UserOptions = {
        storagePath: './storage',
        destPublishScriptFilePath: './publish.bat',
      };

      const directoryNotExistError = new Error('Directory does not exist');

      const spiedIsDirectoryExists = jest.spyOn(fsUtils, 'isDirectoryExists');

      when(spiedIsDirectoryExists)
        .calledWith(userOptions.storagePath).mockResolvedValue(false)
        .calledWith(userOptions.destPublishScriptFilePath).mockResolvedValue(false)
        .calledWith(dirname(userOptions.destPublishScriptFilePath)).mockResolvedValue(true);

      // Act
      const isValid = validator.validateUserOptions(userOptions);

      // Assert
      await expect(isValid).rejects.toThrowError(directoryNotExistError);
    });

    it(`should reject with 'Invalid path' error if the user options.storagePath is empty string`, async () => {
      // Arrange
      const userOptions: UserOptions = {
        storagePath: '',
        destPublishScriptFilePath: './publish.bat',
      };

      const invalidPathError = new Error('Invalid path');

      const spiedIsDirectoryExists = jest.spyOn(fsUtils, 'isDirectoryExists');

      when(spiedIsDirectoryExists)
        .calledWith(userOptions.destPublishScriptFilePath).mockResolvedValue(false)
        .calledWith(dirname(userOptions.destPublishScriptFilePath)).mockResolvedValue(true);

      // Act
      const isValid = validator.validateUserOptions(userOptions);

      // Assert
      await expect(isValid).rejects.toThrowError(invalidPathError);
    });

    it(`should reject with 'Registry is not valid http(s) url' if the user options npmPublishOptions.registry is an empty string`, async () => {
      // Arrange
      const userOptions: UserOptions = {
        storagePath: './storage',
        destPublishScriptFilePath: './publish.bat',
        npmPublishOptions: {
          registry: ''
        }
      };

      setValidStoragePathAndDestPublishScriptFilePath(userOptions);

      // Act
      const isValid = validator.validateUserOptions(userOptions);

      // Assert
      await expect(isValid).resolves.toBe(true);
    });

    it(`should reject with 'Registry is not valid http(s) url' if the user options.npmPublishOptions.registry is not a url`, async () => {
      // Arrange
      const userOptions: UserOptions = {
        storagePath: './storage',
        destPublishScriptFilePath: './publish.bat',
        npmPublishOptions: {
          registry: 'hello'
        }
      };

      const invalidRegistryError = new Error('Registry is not valid http(s) url');

      setValidStoragePathAndDestPublishScriptFilePath(userOptions);

      // Act
      const isValid = validator.validateUserOptions(userOptions);

      // Assert
      await expect(isValid).rejects.toThrowError(invalidRegistryError);
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

    it('should return true if the user options contain existing storage path and non existing destPublishScriptFilePath path and onlyNew.enable is false', async () => {
      // Arrange
      const userOptions: UserOptions = {
        storagePath: './storage',
        destPublishScriptFilePath: './publish.bat',
        onlyNew: {
          enable: false
        }
      };

      setValidStoragePathAndDestPublishScriptFilePath(userOptions);

      // Act
      const isUserOptionsValid = validator.validateUserOptions(userOptions);

      // Assert
      await expect(isUserOptionsValid).resolves.toBe(true);
    });

    it(`should reject with 'Registry is not valid http(s) url' Error if the user options contain invalid onlyNew.registry url`, async () => {
      // Arrange
      const userOptions: UserOptions = {
        storagePath: './storage',
        destPublishScriptFilePath: './publish.bat',
        onlyNew: {
          enable: true,
          registry: 'localhost:4873'
        }
      };

      const invalidOnlyNewRegistry = new Error('Registry is not valid http(s) url');

      const spiedIsDirectoryExists = jest.spyOn(fsUtils, 'isDirectoryExists');

      when(spiedIsDirectoryExists)
        .calledWith(userOptions.storagePath).mockResolvedValue(true)
        .calledWith(userOptions.destPublishScriptFilePath).mockResolvedValue(false)
        .calledWith(dirname(userOptions.destPublishScriptFilePath)).mockResolvedValue(true);

      // Act
      const isValid = validator.validateUserOptions(userOptions);

      // Assert
      await expect(isValid).rejects.toThrowError(invalidOnlyNewRegistry);
    });

    it(`should resolve if the user options.onlyNew.registry is empty string and ping to default registry is successful`, async () => {
      // Arrange
      const userOptions: UserOptions = {
        storagePath: './storage',
        destPublishScriptFilePath: './publish.bat',
        onlyNew: {
          enable: true,
          registry: ''
        }
      };

      const currentRegistry = 'http://localhost:4873';

      setValidStoragePathAndDestPublishScriptFilePath(userOptions);

      const spiedGetCurrentRegistry = jest.spyOn(npmUtils, 'getCurrentRegistry');
      const spiedPingNpmRegistry = jest.spyOn(npmUtils, 'pingNpmRegistry');

      when(spiedGetCurrentRegistry)
        .calledWith().mockReturnValue(currentRegistry);

      when(spiedPingNpmRegistry)
        .calledWith(currentRegistry).mockResolvedValue(true);

      // Act
      const isValid = validator.validateUserOptions(userOptions);

      // Assert
      await expect(isValid).resolves.toBe(true);
    });

    describe('should reject with the error that one of the validation rejected with', () => {

      it.each([
        ['validateStorage'],
        ['validateDestPublishScriptFilePath'],
        ['validateNpmPublishOptionsIfSpecified'],
        ['validateOnlyNewOptionsIfSpecified'],
      ])('should return false if `%s` return false', async (functionName) => {
        // Arrange
        const unknownError = new Error('Unknown error');

        jest.spyOn(validator, 'validateStorage').mockResolvedValue(true);
        jest.spyOn(validator, 'validateDestPublishScriptFilePath').mockResolvedValue(true);
        jest.spyOn(validator, 'validateNpmPublishOptionsIfSpecified').mockResolvedValue(true);
        jest.spyOn(validator, 'validateOnlyNewOptionsIfSpecified').mockResolvedValue(true);

        // @ts-ignore
        jest.spyOn(validator, functionName).mockRejectedValue(unknownError);

        // Act
        const isValid = validator.validateUserOptions({});

        // Assert
        await expect(isValid).rejects.toThrowError(unknownError);
      });

    });

  });

  describe('Validate Storage path', () => {

    it('should be defined', () => {
      expect(validator.validateStorage).toBeDefined();
    });

    it('should return true when storage folder exists', async () => {
      // Arrange
      const storagePath: UserOptions['storagePath'] = './storage';
      jest.spyOn(fsUtils, 'isDirectoryExists').mockResolvedValue(true);

      // Act
      const isStorageValid = validator.validateStorage(storagePath);

      // Assert
      await expect(isStorageValid).resolves.toBe(true);
    });

    it(`should reject with 'Directory does not exist' Error when storage folder doesn't exist`, async () => {
      // Arrange
      const storagePath: UserOptions['storagePath'] = './storage';

      const directoryNotExistError = new Error('Directory does not exist');

      const spiedIsDirectoryExists = jest.spyOn(fsUtils, 'isDirectoryExists');

      when(spiedIsDirectoryExists).expectCalledWith(storagePath).mockResolvedValue(false);

      // Act
      const isStorageValid = validator.validateStorage('./storage');

      // Assert
      verifyAllWhenMocksCalled();
      await expect(isStorageValid).rejects.toThrowError(directoryNotExistError);
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
    ])('should return true when storage path is %s like in %s', async (destPublishScriptFilePath: UserOptions['storagePath'], _osTypePath) => {
      // Arrange
      const spiedIsDirectoryExists = jest.spyOn(fsUtils, 'isDirectoryExists');

      when(spiedIsDirectoryExists).expectCalledWith(destPublishScriptFilePath).mockResolvedValue(true);

      // Act
      const isStorageValid = validator.validateStorage(destPublishScriptFilePath);

      // Assert
      verifyAllWhenMocksCalled();
      await expect(isStorageValid).resolves.toBe(true);
    });

    it(`should reject 'Missing path' Error when passing undefined`, async () => {
      // Arrange
      const missingPathError = new Error('Missing path');

      // Act
      const isStorageValid = validator.validateStorage();

      // Assert
      await expect(isStorageValid).rejects.toThrowError(missingPathError);
    });
  });

  describe('Validate Output publish Script File Path', () => {

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
    ])('should return true when the dest publish script file path is %s like in %s', async (destPublishScriptFilePath: UserOptions['destPublishScriptFilePath'], _osTypePath) => {
      // Arrange
      const spiedIsDirectoryExists = jest.spyOn(fsUtils, 'isDirectoryExists');

      when(spiedIsDirectoryExists)
        .calledWith(destPublishScriptFilePath).mockResolvedValue(false)
        .calledWith(dirname(destPublishScriptFilePath)).mockResolvedValue(true);

      // Act
      const isDestPublishScriptFilePathValid = validator.validateDestPublishScriptFilePath(destPublishScriptFilePath);

      // Assert
      await expect(isDestPublishScriptFilePathValid).resolves.toBe(true);
    });


    it.each([
      ['Linux', '/tmp/'],
      ['Windows', 'C:\\Program Files\\'],
    ])(`should reject with 'Invalid path' error the dest publish script file path pointing to a absolute directory in %s`,
      async (osTypePath, destPublishScriptFilePath: UserOptions['destPublishScriptFilePath']) => {
        // Arrange
        const invalidPathError = new Error('Invalid path');

        // Act
        const isDestPublishScriptFilePathValid = validator.validateDestPublishScriptFilePath(destPublishScriptFilePath);

        // Assert
        await expect(isDestPublishScriptFilePathValid).rejects.toThrowError(invalidPathError);
      });

    it(`should reject with 'Invalid path' error when passing undefined`, async () => {
      // Arrange
      const invalidPathError = new Error('Invalid path');

      // Act
      const isDestPublishScriptFilePathValid = validator.validateDestPublishScriptFilePath(undefined); // NOSONAR

      // Assert
      await expect(isDestPublishScriptFilePathValid).rejects.toThrowError(invalidPathError);
    });

    it(`should reject with 'Invalid path' error when passing empty string`, async () => {
      // Arrange
      const destPublishScriptFilePath = '';

      const invalidPathError = new Error('Invalid path');

      // Act
      const isDestPublishScriptFilePathValid = validator.validateDestPublishScriptFilePath(destPublishScriptFilePath);

      // Assert
      await expect(isDestPublishScriptFilePathValid).rejects.toThrowError(invalidPathError);
    });
  });

  describe('Validate NPM publish options If Specified', () => {

    it('should be defined', () => {
      expect(validator.validateNpmPublishOptionsIfSpecified).toBeDefined();
    });

    it('should return true when passing undefined', async () => {
      // Act
      const isNpmPublishOptionsValid = validator.validateNpmPublishOptionsIfSpecified(undefined); // NOSONAR

      // Assert
      await expect(isNpmPublishOptionsValid).resolves.toBe(true);
    });

    it('should return true when passing empty object', async () => {
      // Act
      const isNpmPublishOptionsValid = validator.validateNpmPublishOptionsIfSpecified({});

      // Assert
      await expect(isNpmPublishOptionsValid).resolves.toBe(true);
    });

    it(`should return true when passing {registry: 'http://localhost:4873'}`, async () => {
      // Arrange
      const npmPublishOptions: UserOptions['npmPublishOptions'] = {registry: 'http://localhost:4873'};

      // Act
      const isNpmPublishOptionsValid = validator.validateNpmPublishOptionsIfSpecified(npmPublishOptions);

      // Assert
      await expect(isNpmPublishOptionsValid).resolves.toBe(true);
    });

    it(`should return true when passing not passing port in the registry key`, async () => {
      // Arrange
      const npmPublishOptions: UserOptions['npmPublishOptions'] = {registry: 'http://localhost'};

      // Act
      const isNpmPublishOptionsValid = validator.validateNpmPublishOptionsIfSpecified(npmPublishOptions);

      // Assert
      await expect(isNpmPublishOptionsValid).resolves.toBe(true);
    });

    it(`should reject with 'Registry is not valid http(s) url' error when not using different protcol than http or https protocol in the registry key`, async () => {
      // Arrange
      const npmPublishOptions: UserOptions['npmPublishOptions'] = {registry: 'ftp://localhost:5873'};
      const invalidRegistryError = new Error('Registry is not valid http(s) url');

      // Act
      const isNpmPublishOptionsValid = validator.validateNpmPublishOptionsIfSpecified(npmPublishOptions);

      // Assert
      await expect(isNpmPublishOptionsValid).rejects.toThrowError(invalidRegistryError);
    });

    it(`should reject with 'Registry is not valid http(s) url' error when not passing protocol in the registry key`, async () => {
      // Arrange
      const npmPublishOptions: UserOptions['npmPublishOptions'] = {registry: 'localhost:5873'};
      const invalidRegistryError = new Error('Registry is not valid http(s) url');

      // Act
      const isNpmPublishOptionsValid = validator.validateNpmPublishOptionsIfSpecified(npmPublishOptions);

      // Assert
      await expect(isNpmPublishOptionsValid).rejects.toThrowError(invalidRegistryError);
    });

    it(`should reject with 'Registry is not valid http(s) url' error when not passing protocol and port in the registry key`, async () => {
      // Arrange
      const npmPublishOptions: UserOptions['npmPublishOptions'] = {registry: 'localhost'};
      const invalidRegistryError = new Error('Registry is not valid http(s) url');

      // Act
      const isNpmPublishOptionsValid = validator.validateNpmPublishOptionsIfSpecified(npmPublishOptions);

      // Assert
      await expect(isNpmPublishOptionsValid).rejects.toThrowError(invalidRegistryError);
    });

    it(`should reject with 'Registry is not valid http(s) url' error when not passing web uri in the registry key`, async () => {
      // Arrange
      const npmPublishOptions: UserOptions['npmPublishOptions'] = {registry: 'Hello how are you'};
      const invalidRegistryError = new Error('Registry is not valid http(s) url');

      // Act
      const isNpmPublishOptionsValid = validator.validateNpmPublishOptionsIfSpecified(npmPublishOptions);

      // Assert
      await expect(isNpmPublishOptionsValid).rejects.toThrowError(invalidRegistryError);
    });

    it(`should return true when passing empty string in the registry key`, async () => {
      // Arrange
      const npmPublishOptions: UserOptions['npmPublishOptions'] = {registry: ''};

      // Act
      const isNpmPublishOptionsValid = validator.validateNpmPublishOptionsIfSpecified(npmPublishOptions);

      // Assert
      await expect(isNpmPublishOptionsValid).resolves.toBe(true);
    });

  });

  describe('Validate Only New Options If Specified', () => {

    const mockGetCurrentRegistry = (getCurrentRegistryResult: string) => {
      const spiedGetCurrentRegistry = jest.spyOn(npmUtils, 'getCurrentRegistry');

      when(spiedGetCurrentRegistry)
        .calledWith().mockReturnValue(getCurrentRegistryResult);
    };

    const mockPingNpmRegistry = (registry: string, pingRegistryResult: boolean) => {
      const spiedPingNpmRegistry = jest.spyOn(npmUtils, 'pingNpmRegistry');

      when(spiedPingNpmRegistry)
        .calledWith(registry).mockResolvedValue(pingRegistryResult);
    };

    it('should be defined', () => {
      expect(validator.validateOnlyNewOptionsIfSpecified).toBeDefined();
    });

    it('should return true when passing undefined', async () => {
      // Act
      const isNpmPublishOptionsValid = validator.validateOnlyNewOptionsIfSpecified(undefined); // NOSONAR

      // Assert
      await expect(isNpmPublishOptionsValid).resolves.toBe(true);
    });

    it('should return true when passing empty object', async () => {
      // Act
      const isNpmPublishOptionsValid = validator.validateOnlyNewOptionsIfSpecified({});

      // Assert
      await expect(isNpmPublishOptionsValid).resolves.toBe(true);
    });

    it(`should return true when passing {enable: false}`, async () => {
      // Arrange
      const onlyNewOptions: UserOptions['onlyNew'] = {enable: false};

      // Act
      const isNpmPublishOptionsValid = validator.validateOnlyNewOptionsIfSpecified(onlyNewOptions);

      // Assert
      await expect(isNpmPublishOptionsValid).resolves.toBe(true);
    });

    it(`should return true when passing enable false and some value in registry`, async () => {
      // Arrange
      const onlyNewOptions: UserOptions['onlyNew'] = {enable: false, registry: 'something'};

      // Act
      const isNpmPublishOptionsValid = validator.validateOnlyNewOptionsIfSpecified(onlyNewOptions);

      // Assert
      await expect(isNpmPublishOptionsValid).resolves.toBe(true);
    });

    it(`should return true when passing { enable: true, registry: undefined } and successfully pinging to current registry`, async () => {
      // Arrange
      const onlyNewOptions: UserOptions['onlyNew'] = {enable: true, registry: undefined};

      const currentRegistry = 'http://localhost:4873';

      mockGetCurrentRegistry(currentRegistry);
      mockPingNpmRegistry(currentRegistry, true);

      // Act
      const isNpmPublishOptionsValid = validator.validateOnlyNewOptionsIfSpecified(onlyNewOptions);

      // Assert
      await expect(isNpmPublishOptionsValid).resolves.toBe(true);
    });


    it(`should return true when passing { enable: true, registry: '' } and successfully pinging to current registry`, async () => {
      // Arrange
      const onlyNewOptions: UserOptions['onlyNew'] = {enable: true, registry: ''};

      const currentRegistry = 'http://localhost:4873';

      mockGetCurrentRegistry(currentRegistry);
      mockPingNpmRegistry(currentRegistry, true);

      // Act
      const isNpmPublishOptionsValid = validator.validateOnlyNewOptionsIfSpecified(onlyNewOptions);

      // Assert
      await expect(isNpmPublishOptionsValid).resolves.toBe(true);
    });

    it(`should reject with 'Ping registry failed, make sure the NPM registry support ping and accessible' error when failing to ping the provided registry url`, async () => {
      // Arrange
      const onlyNewOptions: UserOptions['onlyNew'] = {enable: true, registry: 'http://localhost:4873'};
      const pingRegistryFailed = new Error('Ping registry failed, make sure the NPM registry support ping and accessible');

      mockPingNpmRegistry(onlyNewOptions.registry as string, false);

      // Act
      const isNpmPublishOptionsValid = validator.validateOnlyNewOptionsIfSpecified(onlyNewOptions);

      // Assert
      await expect(isNpmPublishOptionsValid).rejects.toThrowError(pingRegistryFailed);
    });

    it(`should reject with 'Ping registry failed, make sure the NPM registry support ping and accessible' error when failing to ping current registry url`, async () => {
      // Arrange
      const onlyNewOptions: UserOptions['onlyNew'] = {enable: true};
      const pingRegistryFailed = new Error('Ping registry failed, make sure the NPM registry support ping and accessible');

      const currentRegistry = 'http://localhost:4873';

      mockGetCurrentRegistry(currentRegistry);
      mockPingNpmRegistry(currentRegistry, false);

      // Act
      const isNpmPublishOptionsValid = validator.validateOnlyNewOptionsIfSpecified(onlyNewOptions);

      // Assert
      await expect(isNpmPublishOptionsValid).rejects.toThrowError(pingRegistryFailed);
    });

  });
});
