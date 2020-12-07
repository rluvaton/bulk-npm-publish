import {Package} from './storage-explorer';
import {EOL} from 'os';

export interface NpmPublishOptions {
  registry?: string;
}

export interface PublishScriptCreatorOptions {
  npmPublishOptions?: NpmPublishOptions;
  lineTransformer?: (line: string) => string;
}

const npmPublishScriptCreator = (
  packages: Package[],
  options: PublishScriptCreatorOptions = {},
): string => {
  const scriptOptions: string = [
    options?.npmPublishOptions?.registry ? `--registry=${options.npmPublishOptions.registry}` : ''
  ]
    // Keep only the params that aren't empty
    .filter(Boolean)

    // Combine the options
    .join(' ');

  const toPackagePublishScriptTransformerFn = ({path}: Package): string => `npm publish ${path} ${scriptOptions}`.trimRight();

  // If there is line transformer, then after every package to publish script regular transformer call the custom transformer
  const packageTransformer = (options?.lineTransformer) ?
    (p: Package): string => options.lineTransformer!(toPackagePublishScriptTransformerFn(p)) :
    toPackagePublishScriptTransformerFn;

  // We trim only right because there will only be a space in case of empty script options
  return packages
    .map((p) => packageTransformer(p))
    .join(EOL);
};

export default npmPublishScriptCreator;
