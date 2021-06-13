import { NpmPublishOptions } from '../npm-publish-script-creator';
import { getCurrentOS, OSTypes } from '../utils';

export interface UserOptionsGetNewPackages {
  enable?: boolean;
  registry?: string;
}

export interface UserOptions {
  storagePath: string;
  destPublishScriptFilePath: string;
  npmPublishOptions?: NpmPublishOptions;
  onlyNew?: UserOptionsGetNewPackages;
}

const getExtensionBasedOnOS = () => {
  const os = getCurrentOS();

  switch (os) {
    case OSTypes.LINUX:
      return 'sh';
    case OSTypes.WINDOWS:
    default:
      return 'bat';
  }
};

export const DEFAULT_USER_OPTIONS: UserOptions = {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore:disable-next-line Can't be undefined, but undefined here meaning there is no default value
  storagePath: undefined,
  destPublishScriptFilePath: `./publish.${getExtensionBasedOnOS()}`,
  npmPublishOptions: {
    registry: undefined,
  },
  onlyNew: {
    enable: false,
    registry: undefined,
  },
};

export const setDefaultUserOptionsProperties = (
  options: Partial<UserOptions>,
  defaultOptions: UserOptions,
): UserOptions => {
  const combineNpmPublishOptions: NpmPublishOptions = Object.assign(
    {},
    defaultOptions.npmPublishOptions,
    options.npmPublishOptions,
  );
  const combineOnlyNewOptions: UserOptionsGetNewPackages = Object.assign({}, defaultOptions.onlyNew, options.onlyNew);

  return Object.assign({}, defaultOptions, options, {
    npmPublishOptions: combineNpmPublishOptions,
    onlyNew: combineOnlyNewOptions,
  });
};
