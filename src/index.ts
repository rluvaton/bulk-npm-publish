import storageExplorer, { Package } from './storage-explorer';
import npmPublishScriptCreator from './npm-publish-script-creator';
import fileWriter from './file-writer';
import { userOptionGetter } from './options/';
import { logger } from './logger';
import { bold } from 'kleur';
import emoji from 'node-emoji';
import { UserOptions } from './options/user-options';
import path from 'path';
import { validateUserOptions } from './options/validator';
import { getLineTransformer } from './utils/common';
import { filterExistingNpmPackages } from './helpers/filter-existing-npm-packages';

async function getConfigFromUser() {
  let config: UserOptions;
  try {
    config = await userOptionGetter();
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

  try {
    await validateUserOptions(config);
  } catch (err) {
    logger.error(err.message);
    return;
  }

  // Make it absolute path in case the user move the file
  config.storagePath = config.storagePath ?? path.resolve(config.storagePath);
  return config;
}

const run = async () => {
  const config = await getConfigFromUser();

  if (!config) {
    return;
  }

  logger.info('User configuration loaded');

  logger.info(bold().underline(`Packages scanning ${emoji.get(':card_file_box:')}`));
  logger.verbose(`Scanning for packages in the provided storage path (${config.storagePath})`);
  let packages: Package[] = storageExplorer(config.storagePath);

  if (packages.length === 0) {
    logger.info(`Scan complete, no packages found`);

    logger.info(bold().underline('Aborting'));
    return;
  }

  logger.verbose(`Scan complete, found ${packages.length} packages`);

  if (config?.onlyNew?.enable) {
    if (!config.onlyNew.registry) {
      logger.info('using current registry to check for published packages');
    }

    logger.info(bold().underline(`Scanning exist packages ${emoji.get(':card_file_box:')}`));
    logger.verbose(`Scanning for existing packages in the provided registry (${config.onlyNew.registry})`);
    const allPackagesLength = packages.length;

    packages = await filterExistingNpmPackages(packages, config.onlyNew.registry);
    logger.verbose(
      `Scan complete, reduced ${allPackagesLength - packages.length} duplicate packages from ${allPackagesLength}`,
    );
  }

  logger.info(bold().underline(`Creating Script ${emoji.get(':pencil2:')}`));
  logger.verbose(`Creating publish script with this options`, {
    options: config.npmPublishOptions,
  });

  const outputScript: string = npmPublishScriptCreator(packages, {
    npmPublishOptions: config.npmPublishOptions,
    lineTransformer: getLineTransformer(config.destPublishScriptFilePath),
  });

  logger.verbose(`Script creating finished`);

  logger.info(bold().underline(`Writing script file ${emoji.get(':pencil:')}`));

  logger.verbose(`Writing script to file at path (${config.destPublishScriptFilePath})`);

  try {
    await fileWriter(config.destPublishScriptFilePath, outputScript);
  } catch (e) {
    logger.error('Error on writing to file', e);
    return;
  }
  logger.verbose(`Finish writing script`);

  logger.info(bold().underline(emoji.emojify(':fire: Finish! :fire:')));
};

run();
