import * as dotenv from 'dotenv';
dotenv.config();

import storageExplorer, {Package} from './storage-explorer';
import npmPublishScriptCreator, {NpmPublishOptions} from './npm-publish-script-creator';
import fileWriter from './file-writer';

interface BulkNpmPublishConfig {
  storagePath: string;
  destPublishScriptFilePath: string;
  npmPublishOptions?: NpmPublishOptions;
}

export class BulkNpmPublish {

  static async start(config: BulkNpmPublishConfig) {
    console.log('Starting...');

    const packages: Package[] = storageExplorer(config.storagePath);
    let scripts: string[] = npmPublishScriptCreator(packages, config.npmPublishOptions);

    scripts = scripts.map((script) => `call ${script}`);

    fileWriter(config.destPublishScriptFilePath, scripts.join('\n'));
  }
}

BulkNpmPublish.start({
  storagePath: process.env.STORAGE_PATH,
  destPublishScriptFilePath: process.env.PUBLISH_SCRIPT_DEST_PATH,
  npmPublishOptions: {
    registry: process.env.REGISTRY_URL
  }
});
