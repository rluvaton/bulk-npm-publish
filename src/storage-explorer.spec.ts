import 'jest-extended';
import * as mock from 'mock-fs';
import storageExplorer, { Package } from './storage-explorer';

describe('Storage Explorer', () => {
  afterEach(() => {
    mock.restore();
  });

  it('should be defined', () => {
    expect(storageExplorer).toBeDefined();
  });

  it('should get all packages where each folder have 1 package', () => {
    // Prepare the mock FS
    mock({
      storage: {
        'agent-base': {
          'agent-base-4.2.1.tgz': 'dummy data',
          'package.json': 'dummy data'
        }
      }
    });

    const stubStorageExplorer = jest.fn(storageExplorer);

    // Evaluate
    const packages: Package[] = stubStorageExplorer('./storage/');

    expect(stubStorageExplorer).toBeCalledTimes(1);

    // Test

    // Validate that the folder only contain 1 file/folder
    expect(packages).toBeArrayOfSize(1);

    expect(packages).toContainEqual({
      name: 'agent-base',
      fullName: 'agent-base-4.2.1.tgz',
      version: '4.2.1',
      path: 'storage/agent-base/agent-base-4.2.1.tgz'
    } as Package);
  });

  it('should get all packages where each folder have multiple packages', () => {
    // Prepare the mock FS
    mock({
      storage: {
        'agent-base': {
          'agent-base-4.2.1.tgz': 'dummy data',
          'agent-base-4.3.0.tgz': 'dummy data',
          'package.json': 'dummy data'
        }
      }
    });

    // Evaluate
    const packages = storageExplorer('./storage/');

    // Test
    expect(packages).toBeArrayOfSize(2);

    expect(packages).toContainEqual({
      name: 'agent-base',
      fullName: 'agent-base-4.2.1.tgz',
      version: '4.2.1',
      scope: undefined,
      path: 'storage/agent-base/agent-base-4.2.1.tgz'
    } as Package);

    expect(packages).toContainEqual({
      name: 'agent-base',
      fullName: 'agent-base-4.3.0.tgz',
      version: '4.3.0',
      scope: undefined,
      path: 'storage/agent-base/agent-base-4.3.0.tgz'
    } as Package);
  });

  it('should get all packages where each folder have 1/multiple/none packages', () => {
    // Prepare the mock FS
    mock({
      storage: {
        'agent-base': {
          'agent-base-4.2.1.tgz': 'dummy data',
          'agent-base-4.3.0.tgz': 'dummy data',
          'package.json': 'dummy data'
        },
        abbrev: {
          'abbrev-1.1.1.tgz': 'dummy data',
          'package.json': 'dummy data'
        },
        'acorn-walk': {
          'package.json': 'dummy data'
        }
      }
    });

    // Evaluate
    const packages = storageExplorer('./storage/');

    // Test

    // Validate that the folder only contain 3 file/folder
    expect(packages).toBeArrayOfSize(3);

    expect(packages).toContainEqual({
      name: 'agent-base',
      fullName: 'agent-base-4.2.1.tgz',
      version: '4.2.1',
      scope: undefined,
      path: 'storage/agent-base/agent-base-4.2.1.tgz'
    } as Package);

    expect(packages).toContainEqual({
      name: 'agent-base',
      fullName: 'agent-base-4.3.0.tgz',
      version: '4.3.0',
      scope: undefined,
      path: 'storage/agent-base/agent-base-4.3.0.tgz'
    } as Package);

    expect(packages).toContainEqual({
      name: 'abbrev',
      fullName: 'abbrev-1.1.1.tgz',
      version: '1.1.1',
      scope: undefined,
      path: 'storage/abbrev/abbrev-1.1.1.tgz'
    } as Package);
  });

  it('should get all packages where there are packages and scoped packages and each folder have 1/multiple/none package', () => {
    // Prepare the mock FS
    mock({
      storage: {
        'agent-base': {
          'agent-base-4.2.1.tgz': 'dummy data',
          'agent-base-4.3.0.tgz': 'dummy data',
          'package.json': 'dummy data'
        },
        '@types': {
          // tslint:disable-next-line:object-literal-key-quotes
          node: {
            'node-8.9.5.tgz': 'dummy data',
            'index.json': 'dummy data'
          }
        }
      }
    });

    // Evaluate
    const packages = storageExplorer('./storage/');

    // Validate that the folder only contain 3 file/folder
    expect(packages).toBeArrayOfSize(3);

    expect(packages).toContainEqual({
      name: 'agent-base',
      fullName: 'agent-base-4.2.1.tgz',
      version: '4.2.1',
      scope: undefined,
      path: 'storage/agent-base/agent-base-4.2.1.tgz'
    } as Package);

    expect(packages).toContainEqual({
      name: 'agent-base',
      fullName: 'agent-base-4.3.0.tgz',
      version: '4.3.0',
      scope: undefined,
      path: 'storage/agent-base/agent-base-4.3.0.tgz'
    } as Package);

    expect(packages).toContainEqual({
      name: 'node',
      fullName: 'node-8.9.5.tgz',
      version: '8.9.5',
      scope: '@types',
      path: 'storage/@types/node/node-8.9.5.tgz'
    } as Package);
  });

  it('should not get any packages when the directory is empty', () => {
    // Prepare the mock FS
    mock({
      storage: {}
    });

    const stubStorageExplorer = jest.fn(storageExplorer);

    // Evaluate
    const packages: Package[] = stubStorageExplorer('./storage/');

    expect(stubStorageExplorer).toBeCalledTimes(1);

    // Test

    // Validate that the folder only is empty
    expect(packages).toBeArrayOfSize(0);
  });

  it('should not get any packages when there are not tgz file', () => {
    // Prepare the mock FS
    mock({
      storage: {
        'agent-base': {
          'package.json': 'dummy data'
        },
        'package-dir': {
          'nested-dir-1': {},
          'nested-dir-2': {
            'sub-nested-dir-1': {}
          }
        }
      }
    });

    const stubStorageExplorer = jest.fn(storageExplorer);

    // Evaluate
    const packages: Package[] = stubStorageExplorer('./storage/');

    expect(stubStorageExplorer).toBeCalledTimes(1);

    // Test

    // Validate that the folder only is empty
    expect(packages).toBeArrayOfSize(0);
  });
});
