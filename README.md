# Bulk NPM Publish
[![Build Status](https://travis-ci.com/rluvaton/bulk-npm-publish.svg?branch=master)](https://travis-ci.com/rluvaton/bulk-npm-publish)

_CLI Tool for Publishing Multiple NPM packages from [verdaccio](https://verdaccio.org/) storage_
> This Library create batch file with the NPM publish command


<p align="center">
  <img alt="demo" src="https://cdn.jsdelivr.net/gh/rluvaton/bulk-npm-publish@master/docs/demo.svg">
</p>

## Features
- Support publishing to registry
- Publish scoped packages too (i.e `@angular\cli@7.3.9`)
- Support publishing only exists packages' versions (need to provide storage path)
- Have interactive mode (if you don't like the args passing way just pass `-i`)

## Why I did this tool
In my company we use [_verdaccio_](https://verdaccio.org/) for serving packages (like _jest_, _react_ and many more) in our isolated network.

When we wanted to add more packages there weren't any easy solution (coping `storage` folder don't work)

So this tool created for solving this issues


## Install
Install globally from NPM
```bas
npm i bulk-npm-publish -g
```

## Usage
> In different OS you would get different examples


<p align="center">
  <img alt="help" src="https://cdn.jsdelivr.net/gh/rluvaton/bulk-npm-publish@master/docs/help.png">
</p>
<details><summary>Help as text</summary>
<p>

```bash
$ bulk-npm-publish -h
Usage: bulk-npm-publish [options]

Options:
  --version                Show version number                         [boolean]
  -h, --help               Show help                                   [boolean]
  -i, --interactive        If you want to provide input interactively
                                                      [boolean] [default: false]
  --sp, --storage-path     What is the path for the storage you want to publish
                                                                        [string]
  -o, --output             Where the publish script will be created
                                              [string] [default: "./publish.sh"]
  -r, --registry           What is the registry url you want to publish to
                                                                        [string]
  --cs, --current-storage  What's the path for the current storage so the script
                           will publish only new packages               [string]

Examples:
  bulk-npm-publish -i                       Create publish script interactively
  bulk-npm-publish --sp ~/new-storage       Create publish script at
                                            `./publish.sh` with storage content
                                            from `~/new-storage`
  bulk-npm-publish --sp ~/new-storage -o    Create publish script at
  /root/publish-script.sh                   `/root/publish-script.sh` with
                                            storage content from `~/new-storage`
  bulk-npm-publish --sp ~/new-storage -r    Create publish script at
  http://localhost:4873                     `./publish.sh` with storage content
                                            from `~/new-storage` that will
                                            publish to `http://localhost:4873`
  bulk-npm-publish --sp ~/new-storage --cs  Create publish script at
  ~/verdaccio/storage                       `./publish.sh` with storage content
                                            from `~/new-storage` that doesn't
                                            exist in `~/verdaccio/storage`
```

</p>
</details>



## Example
For this command
```bash
$ bulk-npm-publish \
   --storage-path ~/storage \
   --registry http://localhost:4873
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
```sh
npm publish ~/storage/@angular/cli/cli-7.3.9.tgz --registry=http://localhost:4873
npm publish ~/storage/mime/mime-1.6.0.tgz --registry=http://localhost:4873
npm publish ~/storage/ts-node/ts-node-7.0.1.tgz --registry=http://localhost:4873
```

## Test
Run `npm test`
