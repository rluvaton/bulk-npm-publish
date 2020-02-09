# Bulk NPM Publish
[![Build Status](https://travis-ci.com/rluvaton/bulk-npm-publish.svg?branch=master)](https://travis-ci.com/rluvaton/bulk-npm-publish)

_Publish Multiple NPM packages from verdaccio storage_

## Getting Started
1. create `.env` file at the root directory
2. run `npm start`
3. run the created script that been output

### Environment file
create `.env` file for set the configuration
```dotenv
STORAGE_PATH=<storage-path> # (i.e 'C:\\Users\\<user-name>\\AppData\\Roaming\\verdaccio\\storage\\')
PUBLISH_SCRIPT_DEST_PATH=<script-path> # (i.e './publish-all.bat')
REGISTRY_URL=<registry-url> # (i.e 'http://localhost:4873')
```

> If no `REGISTRY_URL` specified it will will create script without the `--registry=<registry-url>`

### Example output
```dotenv
STORAGE_PATH='C:\\Users\\<user-name>\\AppData\\Roaming\\verdaccio\\storage\\'
PUBLISH_SCRIPT_DEST_PATH='./publish-all.bat'
REGISTRY_URL='http://localhost:4873' # Verdaccio url
```

The output is:
```bat
call npm publish C:/Users/<user-name>/AppData/Roaming/verdaccio/storage/@angular/cli/cli-7.3.9.tgz
call npm publish C:/Users/<user-name>/AppData/Roaming/verdaccio/storage/mime/mime-1.6.0.tgz
call npm publish C:/Users/<user-name>/AppData/Roaming/verdaccio/storage/ts-node/ts-node-7.0.1.tgz
```

## Test
Run `npm test` for testing
