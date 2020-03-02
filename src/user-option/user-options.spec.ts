import 'jest-extended';
import {setDefaultUserOptionsProperties, UserOptions} from './user-options';

describe('UserOptions', () => {
  describe('#setDefaultUserOptionsProperties', () => {
    it('when not destPublishScriptFilePath and npmPublishOptions.registry should set this to default', () => {
      const currOptions: UserOptions = {
        storagePath: 'C://',
      };

      const defaultOptions: UserOptions = {
        storagePath: undefined,
        destPublishScriptFilePath: './publish.bat',
        npmPublishOptions: {
          registry: undefined
        }
      };

      const combinedOptions = setDefaultUserOptionsProperties(currOptions, defaultOptions);

      expect(combinedOptions).toBeObject();
      expect(combinedOptions).not.toEqual(currOptions);
      expect(combinedOptions).not.toEqual(defaultOptions);

      expect(combinedOptions).toHaveProperty('storagePath');
      expect(combinedOptions.storagePath).toEqual(currOptions.storagePath);
      expect(combinedOptions.storagePath).not.toEqual(defaultOptions.storagePath);

      expect(combinedOptions).toHaveProperty('destPublishScriptFilePath');
      expect(combinedOptions.destPublishScriptFilePath).not.toEqual(currOptions.destPublishScriptFilePath);
      expect(combinedOptions.destPublishScriptFilePath).toEqual(defaultOptions.destPublishScriptFilePath);

      expect(combinedOptions).toHaveProperty('npmPublishOptions');
      expect(combinedOptions.npmPublishOptions).toBeObject();
      expect(combinedOptions.npmPublishOptions).not.toEqual(currOptions.npmPublishOptions);
      expect(combinedOptions.npmPublishOptions).toEqual(defaultOptions.npmPublishOptions);
    });

    it('when there are all values shouldn\'t change them to the default', () => {
      const currOptions: UserOptions = {
        storagePath: 'C://',
        destPublishScriptFilePath: './my-publish-script.bat',
        npmPublishOptions: {
          registry: 'http://localhost:4873'
        }
      };

      const defaultOptions: UserOptions = {
        storagePath: undefined,
        destPublishScriptFilePath: './publish.bat',
        npmPublishOptions: {
          registry: undefined
        }
      };

      const combinedOptions = setDefaultUserOptionsProperties(currOptions, defaultOptions);

      expect(combinedOptions).toBeObject();
      expect(combinedOptions).toStrictEqual(currOptions);
      expect(combinedOptions).not.toEqual(defaultOptions);

      expect(combinedOptions).toHaveProperty('storagePath');
      expect(combinedOptions.storagePath).not.toEqual(defaultOptions.storagePath);

      expect(combinedOptions).toHaveProperty('destPublishScriptFilePath');
      expect(combinedOptions.destPublishScriptFilePath).not.toEqual(defaultOptions.destPublishScriptFilePath);

      expect(combinedOptions).toHaveProperty('npmPublishOptions');
      expect(combinedOptions.npmPublishOptions).toBeObject();
      expect(combinedOptions.npmPublishOptions).not.toEqual(defaultOptions.npmPublishOptions);
    });
  });
});
