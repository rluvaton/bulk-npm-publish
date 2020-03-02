import storageExplorer, {Package} from './storage-explorer';
import npmPublishScriptCreator, {NpmPublishOptions} from './npm-publish-script-creator';
import fileWriter from './file-writer';
import {UserOptionsGetter} from './user-option/user-options-getter';

interface BulkNpmPublishConfig {
  storagePath: string;
  destPublishScriptFilePath: string;
  npmPublishOptions?: NpmPublishOptions;
}

export class BulkNpmPublish {

  static async start() {
    console.log('Starting...');

    const config: BulkNpmPublishConfig = await UserOptionsGetter.instance.get().catch((err) => {
      console.error('Error on getting user options', err);
      return undefined;
    });

    if (!config) {
      return;
    }

    const packages: Package[] = storageExplorer(config.storagePath);
    let scripts: string[] = npmPublishScriptCreator(packages, config.npmPublishOptions);

    scripts = scripts.map((script) => `call ${script}`);

    fileWriter(config.destPublishScriptFilePath, scripts.join('\n'));
  }
}

BulkNpmPublish.start();
