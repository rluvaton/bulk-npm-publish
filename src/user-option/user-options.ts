import {NpmPublishOptions} from '../npm-publish-script-creator';

export interface UserOptions {
  storagePath: string;
  destPublishScriptFilePath?: string;
  npmPublishOptions?: NpmPublishOptions;
}

export const DEFAULT_USER_OPTIONS: UserOptions = {
  storagePath: undefined,
  destPublishScriptFilePath: './publish.bat',
  npmPublishOptions: {
    registry: undefined
  }
};

export const setDefaultUserOptionsProperties = (options: UserOptions, defaultOptions: UserOptions): UserOptions => {
  const combineNpmPublishOptions: NpmPublishOptions = Object.assign({}, defaultOptions.npmPublishOptions, options.npmPublishOptions);

  return Object.assign({}, defaultOptions, options, {
    npmPublishOptions: combineNpmPublishOptions
  });
};
