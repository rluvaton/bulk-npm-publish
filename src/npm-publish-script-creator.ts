import { Package } from './storage-explorer';
import { EOL } from 'os';

export interface NpmPublishOptions {
  registry?: string;
}

export interface PublishScriptCreatorOptions {
  npmPublishOptions?: NpmPublishOptions;
  lineTransformer?: (line: string) => string;
}

const npmPublishScriptCreator = (packages: Package[], options: PublishScriptCreatorOptions = {}): string => {
  const scriptOptions: string = [
    options?.npmPublishOptions?.registry ? `--registry=${options.npmPublishOptions.registry}` : '',
  ]
    // Keep only the params that aren't empty
    .filter(Boolean)

    // Combine the options
    .join(' ');

  const toPackagePublishScriptTransformerFn = ({ path }: Package): string =>
    `npm publish ${path} ${scriptOptions}`.trimRight();

  // If there is line transformer, then after every package to publish script regular transformer call the custom transformer
  let packageTransformer: (p: Package) => string = toPackagePublishScriptTransformerFn;

  if (options?.lineTransformer) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    packageTransformer = (p: Package): string => options.lineTransformer!(toPackagePublishScriptTransformerFn(p));
  }

  // We trim only right because there will only be a space in case of empty script options
  return packages.map((p) => packageTransformer(p)).join(EOL);
};

export default npmPublishScriptCreator;
