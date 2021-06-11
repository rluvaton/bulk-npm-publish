import 'jest-extended';
import {resetAllWhenMocks, verifyAllWhenMocksCalled, when} from 'jest-when';

jest.mock('npm-registry-fetch', () => {
  const mocked = jest.fn();
  // @ts-ignore
  mocked._actual = jest.requireActual('npm-registry-fetch');

  return mocked;
});

import * as fetch from 'npm-registry-fetch';
import * as npmUtils from './npm-utils';
import {isNpmPackagePublished} from './npm-utils';

describe('NPM Utilities', () => {

  afterEach(() => {
    resetAllWhenMocks();
    jest.clearAllMocks();
  });

  describe('Is NPM package published', () => {
    it('should be defined', () => {
      expect(isNpmPackagePublished).toBeDefined();
    });

    it(`should resolve with true when a SCOPED package is published in current registry`, async () => {
      // Arrange
      const packageToTest = {
        name: 'node',
        scope: '@types',
        version: '8.9.5'
      };
      const currentRegistry = 'http://localhost:4873';

      const spiedGetCurrentRegistry = jest.spyOn(npmUtils, 'getCurrentRegistry');
      when(spiedGetCurrentRegistry)
        .expectCalledWith().mockReturnValue(currentRegistry);

      when(fetch)
        .expectCalledWith('@types/node/-/node-8.9.5.tgz', {method: 'HEAD', registry: currentRegistry}).mockResolvedValue({});

      // Act
      const isPublished = isNpmPackagePublished(packageToTest);

      // Assert
      verifyAllWhenMocksCalled();

      await expect(isPublished).resolves.toBe(true);
      expect(fetch).toBeCalledTimes(1);
    });

    it(`should resolve with false when a SCOPED package isn't published in current registry`, async () => {
      // Arrange
      const packageToTest = {
        name: 'node',
        scope: '@types',
        version: '8.9.5'
      };
      const currentRegistry = 'http://localhost:4873';

      const spiedGetCurrentRegistry = jest.spyOn(npmUtils, 'getCurrentRegistry');
      when(spiedGetCurrentRegistry)
        .expectCalledWith().mockReturnValue(currentRegistry);

      when(fetch)
        .expectCalledWith('@types/node/-/node-8.9.5.tgz', {method: 'HEAD', registry: currentRegistry}).mockRejectedValue({});

      // Act
      const isPublished = isNpmPackagePublished(packageToTest);

      // Assert
      verifyAllWhenMocksCalled();

      await expect(isPublished).resolves.toBe(false);
      expect(fetch).toBeCalledTimes(1);
    });

    it(`should resolve with true when a REGULAR package is published in current registry`, async () => {
      // Arrange
      const packageToTest = {
        name: 'agent-base',
        version: '4.2.1'
      };
      const currentRegistry = 'http://localhost:4873';

      const spiedGetCurrentRegistry = jest.spyOn(npmUtils, 'getCurrentRegistry');
      when(spiedGetCurrentRegistry)
        .expectCalledWith().mockReturnValue(currentRegistry);

      when(fetch)
        .expectCalledWith('agent-base/-/agent-base-4.2.1.tgz', {method: 'HEAD', registry: currentRegistry})
        .mockResolvedValue({});

      // Act
      const isPublished = isNpmPackagePublished(packageToTest);

      // Assert
      verifyAllWhenMocksCalled();

      await expect(isPublished).resolves.toBe(true);
      expect(fetch).toBeCalledTimes(1);
    });

    it(`should resolve with false when a REGULAR package isn't published in current registry`, async () => {
      // Arrange
      const packageToTest = {
        name: 'agent-base',
        version: '4.2.1'
      };
      const currentRegistry = 'http://localhost:4873';

      const spiedGetCurrentRegistry = jest.spyOn(npmUtils, 'getCurrentRegistry');
      when(spiedGetCurrentRegistry)
        .expectCalledWith().mockReturnValue(currentRegistry);

      when(fetch)
        .expectCalledWith('agent-base/-/agent-base-4.2.1.tgz', {method: 'HEAD', registry: currentRegistry})
        .mockRejectedValue({});

      // Act
      const isPublished = isNpmPackagePublished(packageToTest);

      // Assert
      verifyAllWhenMocksCalled();

      await expect(isPublished).resolves.toBe(false);
      expect(fetch).toBeCalledTimes(1);
    });

    it(`should resolve with true when a SCOPED package is published in custom registry`, async () => {
      // Arrange
      const currentRegistry = 'http://localhost:4873';
      const packageToTest = {
        name: 'node',
        scope: '@types',
        version: '8.9.5',
        registry: currentRegistry
      };

      const spiedGetCurrentRegistry = jest.spyOn(npmUtils, 'getCurrentRegistry');

      when(fetch)
        .expectCalledWith('@types/node/-/node-8.9.5.tgz', {method: 'HEAD', registry: currentRegistry}).mockResolvedValue({});

      // Act
      const isPublished = isNpmPackagePublished(packageToTest);

      // Assert
      verifyAllWhenMocksCalled();

      await expect(isPublished).resolves.toBe(true);
      expect(fetch).toBeCalledTimes(1);
      expect(spiedGetCurrentRegistry).toHaveBeenCalledTimes(0);
    });
  });
});
