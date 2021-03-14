import {IUserOptionGetter} from '../i-user-option-getter';
import yargs from 'yargs';
import {logger} from '../../logger';
import {getCurrentOS, getPackageName, OSTypes, removeEmpty} from '../../utils';
import {DEFAULT_USER_OPTIONS, UserOptions} from '../user-options';
import chalk from 'chalk';

const usageExamples: ((...params: any[]) => [string, string])[] = [

  () => [
    `$0 -i`,
    `Create publish script interactively`
  ],

  // Only storage
  (storagePath: string) => [
    `$0 --sp ${storagePath}`,
    `Create publish script at \`${DEFAULT_USER_OPTIONS.destPublishScriptFilePath}\` with storage content from \`${storagePath}\``
  ],

  // Only storage
  (storagePath: string, output: string) => [
    `$0 --sp ${storagePath} -o ${output}`,
    `Create publish script at \`${output}\` with storage content from \`${storagePath}\``
  ],

  // Custom Registry
  (storagePath: string, customRegistry: string) => [
    `$0 --sp ${storagePath} -r ${customRegistry}`,
    `Create publish script at \`${DEFAULT_USER_OPTIONS.destPublishScriptFilePath}\` with storage content from \`${storagePath}\` that will publish to \`${customRegistry}\``
  ],

  // new Only
  (storagePath: string, currentStorage: string) => [
    `$0 --sp ${storagePath} --cs ${currentStorage}`,
    `Create publish script at \`${DEFAULT_USER_OPTIONS.destPublishScriptFilePath}\` with storage content from \`${storagePath}\` that doesn't exist in \`${currentStorage}\``
  ],
];

const defaultUsageExamplesParams: ({ windows: string[], linux: string[] })[] = [
  {
    windows: [],
    linux: []
  },
  {
    windows: ['C:\\new-storage'],
    linux: ['~/new-storage']
  },
  {
    windows: ['C:\\new-storage', 'C:\\Users\\<username>\\Desktop\\publish-script.bat'],
    linux: ['~/new-storage', '/root/publish-script.sh']
  },
  {
    windows: ['C:\\new-storage', 'http://localhost:4873'],
    linux: ['~/new-storage', 'http://localhost:4873']
  },
  {
    windows: ['C:\\new-storage', 'C:\\Users\\username\\AppData\\Roaming\\verdaccio\\storage'],
    linux: ['~/new-storage', '~/verdaccio/storage']
  },
];

export type UserOptionArgGetterResult = Partial<UserOptions> & { interactive?: boolean };

export const userOptionArgGetter: IUserOptionGetter = async (): Promise<UserOptionArgGetterResult> => {
  const os = getCurrentOS() ?? OSTypes.LINUX;
  const usageExampleParamForCurrentOs: string[][] = defaultUsageExamplesParams.map(param => param[os]);

  const args = yargs
    .scriptName(getPackageName())

    .usage(`Usage: $0 ${chalk.gray('[')}options${chalk.gray(']')}`)

    .help('h')
    .alias('h', 'help')

    // Interactive
    .option('i', {
      alias: 'interactive',
      boolean: true,
      description: 'If you want to provide input interactively',
      default: false,
    })

    // Storage Path
    .option('sp', {
      alias: 'storage-path',
      string: true,
      description: 'What is the path for the storage you want to publish',
      nargs: 1,
      requiresArg: true,
    })

    // Publish script output file path
    .option('o', {
      alias: 'output',
      string: true,
      description: 'Where the publish script will be created',
      nargs: 1,
      requiresArg: false,
    })

    // Registry url
    .option('r', {
      alias: 'registry',
      string: true,
      description: 'What is the registry url you want to publish to',
      nargs: 1,
      requiresArg: false,
    })

    // The current storage path to check for existing packages
    .option('cs', {
      alias: 'current-storage',
      string: true,
      description: 'What is the current storage path so the script will only publish new packages',
      nargs: 1,
      requiresArg: false,
    })

    .check((argv) => {
      if (!argv.h && !argv.i && !argv.sp) {
        throw new Error('You must pass either -i (interactive input) or --sp (storage path, for args pass)');
      }
      return true;
    })

    // Ts ignore because the yargs types not updated yet with multiple example at once feature
    // @ts-ignore
    .example(usageExamples.map((usage, index) => usage(...usageExampleParamForCurrentOs[index])))

    .showHelpOnFail(false, chalk.gray('Specify -h or --help for available options'))
    .wrap(yargs.terminalWidth())
    .argv;

  logger.debug('user input in args', args);

  if (args.i) {
    return {interactive: true};
  }

  const userOptions: UserOptions = {
    storagePath: args.sp as string,
    destPublishScriptFilePath: args.o as string,
    npmPublishOptions: !args.r ? undefined : {
      registry: args.r
    },
    onlyNew: !args.cs ? undefined : {
      enable: true,
      currentStoragePath: args.cs
    }
  };

  // Remove properties that are empty or undefined
  removeEmpty(userOptions, (value) => !value);

  return userOptions;
};
