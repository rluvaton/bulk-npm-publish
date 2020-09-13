import 'jest-extended';
import npmPublishScriptCreator from '../../src/npm-publish-script-creator';
import { Package } from '../../src/storage-explorer';
import { EOL } from 'os';

describe('NPM Publish Script Creator', () => {
  it('should be defined', () => {
    expect(npmPublishScriptCreator).toBeDefined();
  });

  it('should create packages for 1 flat package w/o registry', () => {
    const packages: Package[] = [
      {
        name: 'agent-base',
        fullFileName: 'agent-base-4.2.1.tgz',
        fullPackageName: 'agent-base@4.2.1',
        version: '4.2.1',
        path: 'storage/agent-base/agent-base-4.2.1.tgz'
      }
    ];

    const script: string = npmPublishScriptCreator(packages);

    expect(script).toEqual('npm publish storage/agent-base/agent-base-4.2.1.tgz');
  });

  it('should create packages for 1 flat package with registry', () => {
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

    const script: string = npmPublishScriptCreator(packages, {
      registry
    });

    // Test
    expect(script).toEqual(`npm publish storage/agent-base/agent-base-4.2.1.tgz --registry=${registry}`);
  });

  it('should create packages for multiple flat package w/o registry', () => {
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

    const script: string = npmPublishScriptCreator(packages);

    expect(script).toEqual(
      'npm publish storage/agent-base/agent-base-4.2.1.tgz' + EOL +
      'npm publish storage/agent-base/agent-base-4.3.0.tgz'
    );
  });

  it('should create packages for multiple flat package with registry', () => {
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

    const script: string = npmPublishScriptCreator(packages, {
      registry
    });

    expect(script).toEqual(
      `npm publish storage/agent-base/agent-base-4.2.1.tgz --registry=${registry}` + EOL +
      `npm publish storage/agent-base/agent-base-4.3.0.tgz --registry=${registry}`
    );
  });

  it('should create packages for 1 scoped package w/o registry', () => {
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

    const script: string = npmPublishScriptCreator(packages);

    expect(script).toEqual('npm publish storage/@types/node/node-8.9.5.tgz');
  });

  it('should create packages for 1 scoped package with registry', () => {
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

    const script: string = npmPublishScriptCreator(packages, {
      registry
    });

    expect(script).toEqual(`npm publish storage/@types/node/node-8.9.5.tgz --registry=${registry}`);
  });
});
