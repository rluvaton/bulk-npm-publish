import 'jest-extended';
import { DEFAULT_USER_OPTIONS, setDefaultUserOptionsProperties, UserOptions } from './user-options';
import { deepClone } from '../utils/common';

describe('UserOptions', () => {
  describe('#setDefaultUserOptionsProperties', () => {
    it('when not destPublishScriptFilePath and npmPublishOptions.registry should set this to default', () => {
      const currOptions: UserOptions | any = {
        storagePath: 'C://',
      };

      const defaultOptions: UserOptions | any = {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore:disable-next-line Can't be undefined, but undefined here meaning there is no default value
        storagePath: undefined,
        destPublishScriptFilePath: './publish.bat',
        npmPublishOptions: {
          registry: undefined,
        },
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

    it("when there are all values shouldn't change them to the default", () => {
      const currOptions: UserOptions = {
        storagePath: 'C://',
        destPublishScriptFilePath: './my-publish-script.bat',
        npmPublishOptions: {
          registry: 'http://localhost:4873',
        },
        onlyNew: {
          enable: true,
          registry: 'http://localhost:4873',
        },
      };

      const defaultOptions: UserOptions = deepClone(DEFAULT_USER_OPTIONS);

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
