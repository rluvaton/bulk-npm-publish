import { Package } from './storage-explorer';
import { EOL } from 'os';

export interface NpmPublishOptions {
  registry?: string;
}

const npmPublishScriptCreator = (
  packages: Package[],
  options: NpmPublishOptions = {}
): string => {
  const scriptOptions: string = [
    options.registry ? `--registry=${options.registry}` : ''
  ]
    // Keep only the params that aren't empty
    .filter(Boolean)

    // Combine the options
    .join(' ');

  // We trim only right because there will only be a space in case of empty script options
  return packages
    .map(({ path }) => `npm publish ${path} ${scriptOptions}`.trimRight())
    .join(EOL);
};

export default npmPublishScriptCreator;
