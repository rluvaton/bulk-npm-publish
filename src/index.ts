import storageExplorer, {Package} from './storage-explorer';
import npmPublishScriptCreator from './npm-publish-script-creator';
import fileWriter from './file-writer';
import {userOptionGetter} from './user-option/user-options-getter';
import {logger} from './logger';
import {bold} from 'kleur';
import * as emoji from 'node-emoji';
import {UserOptions} from './user-option/user-options';
import {IUserOptionGetter} from './user-option/i-user-option-getter';
import {userOptionEnvGetter} from './user-option/user-option-env-getter';
import {userOptionPromptGetter} from './user-option/user-option-prompt-getter';

// The order is important
const userOptionGetters: IUserOptionGetter[] = [
  userOptionEnvGetter,
  userOptionPromptGetter
];

const run = async () => {
  logger.info(bold().underline('⏳ Starting... ⏳'));

  logger.info(bold().underline(`${emoji.get(':wrench:')} User configuration`));

  let config: UserOptions;
  try {
    config = await userOptionGetter(userOptionGetters);
  } catch (err) {
    if (err.message === 'cancel') {
      logger.error('User Cancelled, exiting...');
      return;
    }

    logger.error(`${emoji.get(':rotating_light:')} Error on getting user options`, err);
    return;
  }

  if (!config) {
    logger.error('Invalid user options, exiting', config);
    return;
  }

  logger.verbose('User configuration loaded');

  logger.info(bold().underline(`Packages scanning ${emoji.get(':card_file_box:')}`));
  logger.verbose(`Scanning for packages in the provided storage path (${config.storagePath})`);
  let packages: Package[] = storageExplorer(config.storagePath);
  logger.verbose(`Scan complete, found ${packages.length} packages`);

  if (config.onlyNew.enable) {
    logger.info(bold().underline(`Scanning Exist Storage ${emoji.get(':card_file_box:')}`));
    logger.verbose(`Scanning for exist packages in the provided storage path (${config.onlyNew.currentStoragePath})`);
    const existPackages: Package[] = storageExplorer(config.onlyNew.currentStoragePath);
    logger.verbose(`Scan complete, found ${packages.length} packages`);

    logger.info(bold().underline(`Filtering duplicate packages ${emoji.get(':card_file_box:')}`));
    logger.verbose(`Start filtering`);
    const beforeReducePackagesLength = packages.length;
    packages = packages.filter((p) => !existPackages.find((existPackage) => p.fullPackageName === existPackage.fullPackageName));
    const newPackagesLength = packages.length;
    const reducedPackagesCount = beforeReducePackagesLength - newPackagesLength;
    logger.verbose(`Filter complete, reduce ${reducedPackagesCount} duplicate packages`);
  }

  logger.info(bold().underline(`Creating Script ${emoji.get(':pencil2:')}`));
  logger.verbose(`Creating publish script with this options`, {options: config.npmPublishOptions});
  let scripts: string[] = npmPublishScriptCreator(packages, config.npmPublishOptions);
  scripts = scripts.map((script) => `call ${script}`);
  logger.verbose(`Script creating finished`);

  logger.info(bold().underline(`Writing script file ${emoji.get(':pencil:')}`));

  logger.verbose(`Writing script to file at path (${config.destPublishScriptFilePath})`);
  try {
    await fileWriter(config.destPublishScriptFilePath, scripts.join('\n'));
  } catch (e) {
    logger.error('Error on writing to file ', e);
    return;
  }
  logger.verbose(`Finish writing script`);

  logger.info(bold().underline(emoji.emojify(':fire: Finish! :fire:')));
}

run();