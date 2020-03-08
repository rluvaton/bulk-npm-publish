import storageExplorer, {Package} from './storage-explorer';
import npmPublishScriptCreator from './npm-publish-script-creator';
import fileWriter from './file-writer';
import {UserOptionsGetter} from './user-option/user-options-getter';
import {logger} from './logger';
import {bold} from 'kleur';
import * as emoji from 'node-emoji';
import {UserOptions} from './user-option/user-options';

export class BulkNpmPublish {

  static async start() {
    logger.info(bold().underline('⏳ Starting... ⏳'));

    logger.info(bold().underline(`${emoji.get(':wrench:')} User configuration`));

    let config: UserOptions;
    try {
      config = await UserOptionsGetter.instance.get();
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
}

BulkNpmPublish.start();
