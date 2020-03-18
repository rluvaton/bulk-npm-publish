# Bulk NPM Publish
[![Build Status](https://travis-ci.com/rluvaton/bulk-npm-publish.svg?branch=master)](https://travis-ci.com/rluvaton/bulk-npm-publish)

_Publish Multiple NPM packages from [verdaccio](https://verdaccio.org/) storage_
> This Library create batch file with the NPM publish command


<p align="center">
  <img src="https://cdn.jsdelivr.net/gh/rluvaton/bulk-npm-publish@master/docs/demo.svg">
</p>

## Features
- Support publishing to registry
- Publish scoped packages too (i.e `@angular\cli@7.3.9`)
- Support publishing only exists packages' versions (need to provide storage path) (:warning: not supported in env file)

## Why I did this tool
In my company we have [_verdaccio_](https://verdaccio.org/) server for serving packages (like _jest_, _react_ and many more) in our isolated network.

When we wanted to add more packages there weren't any easy solution (coping `storage` folder don't work)

So this tool created for creating script for publishing multiple npm package


## Getting Started
**You have 2 options to run this**
1. Interactive input
2. `.env` file (will be deprecated in the future)

> If _registry url_ specified it will create script with `--registry=<registry-url>`

### Interactive Input
1. run `npm start`
2. type your input
3. Run the created script that been output

### `.env`
1. create `.env` file at the root directory
2. run `npm start`
3. run the created script that been output

#### Environment file format
create `.env` file for set the configuration
```dotenv
STORAGE_PATH=<storage-path> # (i.e 'C:\\Users\\<user-name>\\AppData\\Roaming\\verdaccio\\storage\\')
PUBLISH_SCRIPT_DEST_PATH=<script-path> # (i.e './publish-all.bat')
REGISTRY_URL=<registry-url> # (i.e 'http://localhost:4873')
```


## Example
For this options
```yaml
storage path: 'C:\\Users\\<user-name>\\AppData\\Roaming\\verdaccio\\storage\\'
publish script dest path: './publish-all.bat'
registry url: 'http://localhost:4873' # Verdaccio url
```

And this storage content (the files and folders in the storage path)
```yaml
storage:
    - @angular:
      - cli: # Scope package
        - cli-7.3.9.tgz
    - mime:
      - mime-1.6.0.tgz
    - ts-node:
      - ts-node-7.0.1.tgz
```

The output will be:
```bat
call npm publish C:/Users/<user-name>/AppData/Roaming/verdaccio/storage/@angular/cli/cli-7.3.9.tgz
call npm publish C:/Users/<user-name>/AppData/Roaming/verdaccio/storage/mime/mime-1.6.0.tgz
call npm publish C:/Users/<user-name>/AppData/Roaming/verdaccio/storage/ts-node/ts-node-7.0.1.tgz
```

## Test
Run `npm test`
