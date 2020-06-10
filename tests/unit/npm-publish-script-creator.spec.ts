import 'jest-extended';
import npmPublishScriptCreator from '../../src/npm-publish-script-creator';
import { Package } from '../../src/storage-explorer';

describe('NPM Publish Script Creator', () => {
  it('should be defined', () => {
    expect(npmPublishScriptCreator).toBeDefined();
  });

  it('should create packages for 1 flat package w/o registry', () => {
    // Prepare
    const packages: Package[] = [
      {
        name: 'agent-base',
        fullFileName: 'agent-base-4.2.1.tgz',
        fullPackageName: 'agent-base@4.2.1',
        version: '4.2.1',
        path: 'storage/agent-base/agent-base-4.2.1.tgz'
      }
    ];

    // Evaluate
    const script: string[] = npmPublishScriptCreator(packages);

    // Test
    expect(script).toBeArrayOfSize(1);

    expect(script).toContainEqual(
      'npm publish storage/agent-base/agent-base-4.2.1.tgz'
    );
  });

  it('should create packages for 1 flat package with registry', () => {
    // Prepare
    const packages: Package[] = [
      {
        name: 'agent-base',
        fullFileName: 'agent-base-4.2.1.tgz',
        fullPackageName: 'agent-base@4.2.1',
        version: '4.2.1',
        path: 'storage/agent-base/agent-base-4.2.1.tgz'
      }
    ];

    const registry = 'http://localhost:4873';

    // Evaluate
    const script: string[] = npmPublishScriptCreator(packages, {
      registry
    });

    // Test
    expect(script).toBeArrayOfSize(1);

    expect(script).toContainEqual(
      `npm publish storage/agent-base/agent-base-4.2.1.tgz --registry=${registry}`
    );
  });

  it('should create packages for multiple flat package w/o registry', () => {
    // Prepare
    const packages: Package[] = [
      {
        name: 'agent-base',
        fullFileName: 'agent-base-4.2.1.tgz',
        fullPackageName: 'agent-base@4.2.1',
        version: '4.2.1',
        path: 'storage/agent-base/agent-base-4.2.1.tgz'
      },
      {
        name: 'agent-base',
        fullFileName: 'agent-base-4.3.0.tgz',
        fullPackageName: 'agent-base@4.3.0',
        version: '4.3.0',
        path: 'storage/agent-base/agent-base-4.3.0.tgz'
      }
    ];

    // Evaluate
    const script: string[] = npmPublishScriptCreator(packages);

    // Test
    expect(script).toBeArrayOfSize(2);

    expect(script).toContainEqual(
      'npm publish storage/agent-base/agent-base-4.2.1.tgz'
    );

    expect(script).toContainEqual(
      'npm publish storage/agent-base/agent-base-4.3.0.tgz'
    );
  });

  it('should create packages for multiple flat package with registry', () => {
    // Prepare
    const packages: Package[] = [
      {
        name: 'agent-base',
        fullFileName: 'agent-base-4.2.1.tgz',
        fullPackageName: 'agent-base@4.2.1',
        version: '4.2.1',
        path: 'storage/agent-base/agent-base-4.2.1.tgz'
      },
      {
        name: 'agent-base',
        fullFileName: 'agent-base-4.3.0.tgz',
        fullPackageName: 'agent-base@4.3.0',
        version: '4.3.0',
        path: 'storage/agent-base/agent-base-4.3.0.tgz'
      }
    ];

    const registry = 'http://localhost:4873';

    // Evaluate
    const script: string[] = npmPublishScriptCreator(packages, {
      registry
    });

    // Test
    expect(script).toBeArrayOfSize(2);

    expect(script).toContainEqual(
      `npm publish storage/agent-base/agent-base-4.2.1.tgz --registry=${registry}`
    );

    expect(script).toContainEqual(
      `npm publish storage/agent-base/agent-base-4.3.0.tgz --registry=${registry}`
    );
  });

  it('should create packages for 1 scoped package w/o registry', () => {
    // Prepare
    const packages: Package[] = [
      {
        name: 'node',
        fullFileName: 'node-8.9.5.tgz',
        fullPackageName: '@types/node@8.9.5',
        version: '8.9.5',
        scope: '@types',
        path: 'storage/@types/node/node-8.9.5.tgz'
      }
    ];

    // Evaluate
    const script: string[] = npmPublishScriptCreator(packages);

    // Test
    expect(script).toBeArrayOfSize(1);

    expect(script).toContainEqual(
      'npm publish storage/@types/node/node-8.9.5.tgz'
    );
  });

  it('should create packages for 1 scoped package with registry', () => {
    // Prepare
    const packages: Package[] = [
      {
        name: 'node',
        fullFileName: 'node-8.9.5.tgz',
        fullPackageName: '@types/node@8.9.5',
        version: '8.9.5',
        scope: '@types',
        path: 'storage/@types/node/node-8.9.5.tgz'
      }
    ];

    const registry = 'http://localhost:4873';

    // Evaluate
    const script: string[] = npmPublishScriptCreator(packages, {
      registry
    });

    // Test
    expect(script).toBeArrayOfSize(1);

    expect(script).toContainEqual(
      `npm publish storage/@types/node/node-8.9.5.tgz --registry=${registry}`
    );
  });
});
