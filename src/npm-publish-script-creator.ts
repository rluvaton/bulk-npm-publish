import {Package} from './storage-explorer';

export interface NpmPublishOptions {
  registry?: string;
}

const npmPublishScriptCreator = (packages: Package[], options: NpmPublishOptions = {}): string[] => {
  return packages.map((singlePackage) => `npm publish ${singlePackage.path} ${options.registry ? `--registry=${options.registry}` : ''}`.trim());
};

export default npmPublishScriptCreator;
