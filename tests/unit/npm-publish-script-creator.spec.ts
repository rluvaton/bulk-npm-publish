import 'jest-extended';
import each from 'jest-each';
import npmPublishScriptCreator, {PublishScriptCreatorOptions} from '../../src/npm-publish-script-creator';
import {Package} from '../../src/storage-explorer';
import {EOL} from 'os';

const fakePackageGenerator = {
  oneFlatPackage: (): Package[] => [{
    name: 'agent-base',
    fullFileName: 'agent-base-4.2.1.tgz',
    fullPackageName: 'agent-base@4.2.1',
    version: '4.2.1',
    path: 'storage/agent-base/agent-base-4.2.1.tgz'
  }],

  multipleFlatPackages: (): Package[] => [
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
  ],

  oneScopedPackage: (): Package[] => [
    {
      name: 'node',
      fullFileName: 'node-8.9.5.tgz',
      fullPackageName: '@types/node@8.9.5',
      version: '8.9.5',
      scope: '@types',
      path: 'storage/@types/node/node-8.9.5.tgz'
    }
  ],

  multipleScopedPackage: (): Package[] => [
    {
      name: 'node',
      fullFileName: 'node-8.9.5.tgz',
      fullPackageName: '@types/node@8.9.5',
      version: '8.9.5',
      scope: '@types',
      path: 'storage/@types/node/node-8.9.5.tgz'
    },
    {
      name: 'jest',
      fullFileName: 'jest-24.0.0.tgz',
      fullPackageName: '@types/jest@24.0.0',
      version: '24.0.0',
      scope: '@types',
      path: 'storage/@types/jest/jest-24.0.0.tgz'
    }
  ],
  mixedPackages: (): Package[] => [
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
  ],
};

const getLineTransformerFn = () => jest.fn((line) => `CALL ${line}`);

describe('NPM Publish Script Creator', () => {
  it('should be defined', () => {
    expect(npmPublishScriptCreator).toBeDefined();
  });

  function testNpmPublishScriptCreator({options, packages, expectedScript}: { options: PublishScriptCreatorOptions, packages: Package[], expectedScript: string }) {
    if (options.lineTransformer) {
      expect((options.lineTransformer as jest.Mock)).toBeCalledTimes(0);
    }

    const script: string = npmPublishScriptCreator(packages, options);

    if (options.lineTransformer) {
      expect((options.lineTransformer as jest.Mock)).toBeCalledTimes(packages.length);
    }

    expect(script).toEqual(expectedScript);
  }

  each([
    ['w/o registry and line transformer', {}, 'npm publish storage/agent-base/agent-base-4.2.1.tgz'],
    ['w/ registry and w/o line transformer', {npmPublishOptions: {registry: 'http://localhost:4873'}}, 'npm publish storage/agent-base/agent-base-4.2.1.tgz --registry=http://localhost:4873'],
    ['w/o registry and w/ line transformer', {lineTransformer: getLineTransformerFn()}, 'CALL npm publish storage/agent-base/agent-base-4.2.1.tgz'],
    ['w registry and line transformer', {
      npmPublishOptions: {registry: 'http://localhost:4873'},
      lineTransformer: getLineTransformerFn()
    }, 'CALL npm publish storage/agent-base/agent-base-4.2.1.tgz --registry=http://localhost:4873'],
  ] as Array<[string, PublishScriptCreatorOptions, string]>)
    .it('should create publish script for 1 flat package %s', (title, options: PublishScriptCreatorOptions, expectedScript) => {
      testNpmPublishScriptCreator({options, packages: fakePackageGenerator.oneFlatPackage(), expectedScript});
    });

  each([
    ['w/o registry and line transformer', {}, `npm publish storage/agent-base/agent-base-4.2.1.tgz${EOL}npm publish storage/agent-base/agent-base-4.3.0.tgz`],
    ['w/ registry and w/o line transformer', {npmPublishOptions: {registry: 'http://localhost:4873'}}, `npm publish storage/agent-base/agent-base-4.2.1.tgz --registry=http://localhost:4873${EOL}npm publish storage/agent-base/agent-base-4.3.0.tgz --registry=http://localhost:4873`],
    ['w/o registry and w/ line transformer', {lineTransformer: getLineTransformerFn()}, `CALL npm publish storage/agent-base/agent-base-4.2.1.tgz${EOL}CALL npm publish storage/agent-base/agent-base-4.3.0.tgz`],
    ['w registry and line transformer', {
      npmPublishOptions: {registry: 'http://localhost:4873'},
      lineTransformer: getLineTransformerFn()
    }, `CALL npm publish storage/agent-base/agent-base-4.2.1.tgz --registry=http://localhost:4873${EOL}CALL npm publish storage/agent-base/agent-base-4.3.0.tgz --registry=http://localhost:4873`],
  ] as Array<[string, PublishScriptCreatorOptions, string]>)
    .it('should create publish script for multiple flat packages %s', (title, options: PublishScriptCreatorOptions, expectedScript) => {
      testNpmPublishScriptCreator({options, packages: fakePackageGenerator.multipleFlatPackages(), expectedScript});
    });

  each([
    ['w/o registry and line transformer', {}, 'npm publish storage/@types/node/node-8.9.5.tgz'],
    ['w/ registry and w/o line transformer', {npmPublishOptions: {registry: 'http://localhost:4873'}}, 'npm publish storage/@types/node/node-8.9.5.tgz --registry=http://localhost:4873'],
    ['w/o registry and w/ line transformer', {lineTransformer: getLineTransformerFn()}, `CALL npm publish storage/@types/node/node-8.9.5.tgz`],
    ['w registry and line transformer', {
      npmPublishOptions: {registry: 'http://localhost:4873'},
      lineTransformer: getLineTransformerFn()
    }, 'CALL npm publish storage/@types/node/node-8.9.5.tgz --registry=http://localhost:4873'],
  ] as Array<[string, PublishScriptCreatorOptions, string]>)
    .it('should create publish script for 1 scoped package %s', (title, options: PublishScriptCreatorOptions, expectedScript) => {
      testNpmPublishScriptCreator({options, packages: fakePackageGenerator.oneScopedPackage(), expectedScript});
    });

  each([
    ['w/o registry and line transformer', {}, `npm publish storage/@types/node/node-8.9.5.tgz${EOL}npm publish storage/@types/jest/jest-24.0.0.tgz`],
    ['w/ registry and w/o line transformer', {npmPublishOptions: {registry: 'http://localhost:4873'}}, `npm publish storage/@types/node/node-8.9.5.tgz --registry=http://localhost:4873${EOL}npm publish storage/@types/jest/jest-24.0.0.tgz --registry=http://localhost:4873`],
    ['w/o registry and w/ line transformer', {lineTransformer: getLineTransformerFn()}, `CALL npm publish storage/@types/node/node-8.9.5.tgz${EOL}CALL npm publish storage/@types/jest/jest-24.0.0.tgz`],
    ['w registry and line transformer', {
      npmPublishOptions: {registry: 'http://localhost:4873'},
      lineTransformer: getLineTransformerFn()
    }, `CALL npm publish storage/@types/node/node-8.9.5.tgz --registry=http://localhost:4873${EOL}CALL npm publish storage/@types/jest/jest-24.0.0.tgz --registry=http://localhost:4873`],
  ] as Array<[string, PublishScriptCreatorOptions, string]>)
    .it('should create publish script for multiple scoped package %s', (title, options: PublishScriptCreatorOptions, expectedScript) => {
      testNpmPublishScriptCreator({options, packages: fakePackageGenerator.multipleScopedPackage(), expectedScript});
    });

  each([
    ['w/o registry and line transformer', {}, `npm publish storage/agent-base/agent-base-4.2.1.tgz${EOL}npm publish storage/@types/node/node-8.9.5.tgz`],
    ['w/ registry and w/o line transformer', {npmPublishOptions: {registry: 'http://localhost:4873'}}, `npm publish storage/agent-base/agent-base-4.2.1.tgz --registry=http://localhost:4873${EOL}npm publish storage/@types/node/node-8.9.5.tgz --registry=http://localhost:4873`],
    ['w/o registry and w/ line transformer', {lineTransformer: getLineTransformerFn()}, `CALL npm publish storage/agent-base/agent-base-4.2.1.tgz${EOL}CALL npm publish storage/@types/node/node-8.9.5.tgz`],
    ['w registry and line transformer', {
      npmPublishOptions: {registry: 'http://localhost:4873'},
      lineTransformer: getLineTransformerFn()
    }, `CALL npm publish storage/agent-base/agent-base-4.2.1.tgz --registry=http://localhost:4873${EOL}CALL npm publish storage/@types/node/node-8.9.5.tgz --registry=http://localhost:4873`],
  ] as Array<[string, PublishScriptCreatorOptions, string]>)
    .it('should create publish script for multiple scoped package %s', (title, options: PublishScriptCreatorOptions, expectedScript) => {
      testNpmPublishScriptCreator({options, packages: fakePackageGenerator.mixedPackages(), expectedScript});
    });
});
