import {NpmPublishOptions} from '../npm-publish-script-creator';

export interface UserOptionsGetNewPackages {
  enable?: boolean,
  currentStoragePath?: string
}

export interface UserOptions {
  storagePath: string;
  destPublishScriptFilePath?: string;
  npmPublishOptions?: NpmPublishOptions;
  onlyNew?: UserOptionsGetNewPackages
}

export const DEFAULT_USER_OPTIONS: UserOptions = {
  storagePath: undefined,
  destPublishScriptFilePath: './publish.bat',
  npmPublishOptions: {
    registry: undefined
  },
  onlyNew: {
    enable: false,
    currentStoragePath: undefined
  }
};


export const setDefaultUserOptionsProperties = (options: UserOptions, defaultOptions: UserOptions): UserOptions => {
  const combineNpmPublishOptions: NpmPublishOptions = Object.assign({}, defaultOptions.npmPublishOptions, options.npmPublishOptions);
  const combineOnlyNewOptions: UserOptionsGetNewPackages = Object.assign({}, defaultOptions.onlyNew, options.onlyNew);

  return Object.assign({}, defaultOptions, options, {
    npmPublishOptions: combineNpmPublishOptions,
    onlyNew: combineOnlyNewOptions
  });
};
