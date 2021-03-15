import 'jest-extended';
import {resetAllWhenMocks, verifyAllWhenMocksCalled, when} from 'jest-when';

import * as npmUtils from '../../../src/npm-utils';
import {filterExistingNpmPackages} from '../../../src/helpers/filter-existing-npm-packages';
import {Package} from '../../../src/storage-explorer';

describe('Filter existing npm packages', () => {

  afterEach(() => {
    resetAllWhenMocks();
  });

  it('should be defined', () => {
    expect(filterExistingNpmPackages).toBeDefined();
  });

  it(`when getting packages with scoped and unscoped packages that all of them exist it should return resolved promise with empty array`, async () => {
    // Arrange
    const packages: Package[] = [
      {
        name: 'agent-base',
        fullFileName: 'agent-base-4.2.1.tgz',
        fullPackageName: 'agent-base@4.2.1',
        version: '4.2.1',
        path: 'storage/agent-base/agent-base-4.2.1.tgz'
      },
      {
        name: 'node',
        fullFileName: 'node-8.9.5.tgz',
        fullPackageName: '@types/node@8.9.5',
        version: '8.9.5',
        scope: '@types',
        path: 'storage/@types/node/node-8.9.5.tgz'
      },
    ];

    const currentRegistry = 'http://localhost:4873';

    const spiedGetCurrentRegistry = jest.spyOn(npmUtils, 'getCurrentRegistry');
    when(spiedGetCurrentRegistry)
      .expectCalledWith().mockReturnValue(currentRegistry)

    const spiedIsNpmPackagePublished = jest.spyOn(npmUtils, 'isNpmPackagePublished');
    spiedIsNpmPackagePublished.mockResolvedValue(true);

    // Act
    const unpublishedPackages = filterExistingNpmPackages(packages);

    // Assert
    verifyAllWhenMocksCalled();

    await expect(unpublishedPackages).resolves.toBeArrayOfSize(0);
    expect(spiedIsNpmPackagePublished).toBeCalledTimes(2);

    expect(spiedIsNpmPackagePublished).toBeCalledWith({
      name: packages[0].name,
      version: packages[0].version,
      registry: currentRegistry
    });

    expect(spiedIsNpmPackagePublished).toBeCalledWith({
      scope: packages[1].scope,
      name: packages[1].name,
      version: packages[1].version,
      registry: currentRegistry
    });

    const returnedResult = spiedIsNpmPackagePublished.mock.results.filter(result => result.type === 'return');
    expect(returnedResult).toBeArrayOfSize(2);
    await expect(returnedResult[0].value).resolves.toBe(true);
    await expect(returnedResult[1].value).resolves.toBe(true);
  });

  it(`when getting packages with scoped and unscoped packages that none of them exist it should return resolved promise with the same packages from input`, async () => {
    // Arrange
    const packages: Package[] = [
      {
        name: 'agent-base',
        fullFileName: 'agent-base-4.2.1.tgz',
        fullPackageName: 'agent-base@4.2.1',
        version: '4.2.1',
        path: 'storage/agent-base/agent-base-4.2.1.tgz'
      },
      {
        name: 'node',
        fullFileName: 'node-8.9.5.tgz',
        fullPackageName: '@types/node@8.9.5',
        version: '8.9.5',
        scope: '@types',
        path: 'storage/@types/node/node-8.9.5.tgz'
      },
    ];

    const currentRegistry = 'http://localhost:4873';

    const spiedGetCurrentRegistry = jest.spyOn(npmUtils, 'getCurrentRegistry');
    when(spiedGetCurrentRegistry)
      .expectCalledWith().mockReturnValue(currentRegistry)

    const spiedIsNpmPackagePublished = jest.spyOn(npmUtils, 'isNpmPackagePublished');
    spiedIsNpmPackagePublished.mockResolvedValue(false);

    // Act
    const unpublishedPackages = filterExistingNpmPackages(packages);

    // Assert
    verifyAllWhenMocksCalled();

    await expect(unpublishedPackages).resolves.toIncludeSameMembers(packages);

    expect(spiedIsNpmPackagePublished).toBeCalledTimes(2);

    expect(spiedIsNpmPackagePublished).toBeCalledWith({
      name: packages[0].name,
      version: packages[0].version,
      registry: currentRegistry
    });

    expect(spiedIsNpmPackagePublished).toBeCalledWith({
      scope: packages[1].scope,
      name: packages[1].name,
      version: packages[1].version,
      registry: currentRegistry
    });

    const returnedResult = spiedIsNpmPackagePublished.mock.results.filter(result => result.type === 'return');
    expect(returnedResult).toBeArrayOfSize(2);
    await expect(returnedResult[0].value).resolves.toBe(false);
    await expect(returnedResult[1].value).resolves.toBe(false);
  });

  it(`when getting packages with scoped and unscoped packages that some of them exist it should return resolved promise with the packages that not published`, async () => {
    // Arrange
    const packages: Package[] = [
      {
        name: 'agent-base',
        fullFileName: 'agent-base-4.2.1.tgz',
        fullPackageName: 'agent-base@4.2.1',
        version: '4.2.1',
        path: 'storage/agent-base/agent-base-4.2.1.tgz'
      },
      {
        name: 'node',
        fullFileName: 'node-8.9.5.tgz',
        fullPackageName: '@types/node@8.9.5',
        version: '8.9.5',
        scope: '@types',
        path: 'storage/@types/node/node-8.9.5.tgz'
      },
    ];

    const currentRegistry = 'http://localhost:4873';

    const spiedGetCurrentRegistry = jest.spyOn(npmUtils, 'getCurrentRegistry');
    when(spiedGetCurrentRegistry)
      .expectCalledWith().mockReturnValue(currentRegistry)

    const spiedIsNpmPackagePublished = jest.spyOn(npmUtils, 'isNpmPackagePublished');
    spiedIsNpmPackagePublished.mockResolvedValueOnce(false);
    spiedIsNpmPackagePublished.mockResolvedValueOnce(true);

    // Act
    const unpublishedPackages = filterExistingNpmPackages(packages);

    // Assert
    verifyAllWhenMocksCalled();

    await expect(unpublishedPackages).resolves.toIncludeSameMembers([packages[0]]);
    expect(spiedIsNpmPackagePublished).toBeCalledTimes(2);

    expect(spiedIsNpmPackagePublished).toBeCalledWith({
      name: packages[0].name,
      version: packages[0].version,
      registry: currentRegistry
    });

    expect(spiedIsNpmPackagePublished).toBeCalledWith({
      scope: packages[1].scope,
      name: packages[1].name,
      version: packages[1].version,
      registry: currentRegistry
    });

    const returnedResult = spiedIsNpmPackagePublished.mock.results.filter(result => result.type === 'return');
    expect(returnedResult).toBeArrayOfSize(2);
    await expect(returnedResult[0].value).resolves.toBe(false);
    await expect(returnedResult[1].value).resolves.toBe(true);
  });

});
