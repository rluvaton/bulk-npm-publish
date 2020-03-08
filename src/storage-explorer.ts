import * as dirTree from 'directory-tree';
import {logger} from './logger';
import * as emoji from 'node-emoji';


/**
 * Package details
 * @example for package @jest/core@5.0.0
 * The directory structure is like:
 * - storage:
 *    - @jest:
 *      - core:
 *        - core-5.0.0.tgz
 *        - index.json
 *
 * The package is:
 * {
 *   name: 'core',
 *   scope: '@jest',
 *   fullFileName: 'core-5.0.0.tgz',
 *   fullPackageMame: '@jest/core@5.0.0'
 *   version: '5.0.0',
 *   path: './storage/@jest/core/core-5.0.0.tgz'
 * } as Package
 */
export interface Package {
  /**
   * Name of the package
   * @example for package `@jest/core@5.0.0` the name is **`core`**
   */
  name: string;

  /**
   * The full name of the file
   * @example for package `@jest/core@5.0.0` the full file name is **`core-5.0.0.tgz`**
   */
  fullFileName: string;

  /**
   * The full name of the package
   * @example for package `./storage/@jest/core/core-5.0.0.tgz'` the full package name is **`@jest/core@5.0.0`**
   */
  fullPackageName: string;

  /**
   * The version of the package
   * @example for package `@jest/core@5.0.0` the version is **`5.0.0`**
   */
  version: string;

  /**
   * The full path to the package
   * @example for package `@jest/core@5.0.0` the path is **`'./storage/@jest/core/core-5.0.0.tgz'`**
   */
  path: string;

  /**
   * The scope of the package
   * @example for package `@jest/core@5.0.0` the scope is **`@jest`**
   */
  scope?: string;
}

/**
 * Get the version from the full file name
 * @param packageName
 * @param fullPackageName
 * @return Package version in string
 *
 * @example `getVersionFromFileName('core', 'core-5.0.0.tgz')` will return `5.0.0`
 */
function getVersionFromFileName(packageName, fullPackageName: string): string {
  if (fullPackageName.startsWith(packageName + '-')) {
    fullPackageName = fullPackageName.substring((packageName + '-').length);
  }

  const PACKAGE_EXTENSION = '.tgz';
  if (fullPackageName.endsWith(PACKAGE_EXTENSION)) {
    fullPackageName = fullPackageName.substring(0, fullPackageName.length - (PACKAGE_EXTENSION.length));
  }

  return fullPackageName;
}

const storageExplorer = (dir: string): Package[] => {
  const packages: Package[] = [];
  let packageVersion: string;

  // Get all folder in dir
  // Get all tgz files in the subdirectory
  const filteredTree = dirTree(dir, {extensions: /\.tgz/, normalizePath: true});

  if (!filteredTree) {
    logger.warn(`${emoji.get(':rotating_light:')}  No files found`, {dir});
    return [];
  }

  const storageFolders = filteredTree.children;

  storageFolders.forEach((packagesFolders) => {
    const packageOrScopeName: string = packagesFolders.name;

    packagesFolders.children.forEach((packageOrScope) => {
      switch (packageOrScope.type) {
        case 'directory':
          // Meaning it's a scope
          const packageName = packageOrScope.name;

          const scopePackages = packageOrScope.children
            // Fix #9 (adding none `tgz` file to the script)
            .filter((packageInScope) => packageInScope.type === 'file' && packageInScope.extension === '.tgz')
            .map((packageInScope) => {
              packageVersion = getVersionFromFileName(packageName, packageInScope.name);
              const scopePackage: Package = {
                name: packageName,
                fullFileName: packageInScope.name,
                fullPackageName: `${packageOrScopeName}/${packageName}@${packageVersion}`,
                path: packageInScope.path,
                version: packageVersion,
                scope: packageOrScopeName
              };

              logger.debug('Found new package in scope', scopePackage);

              return scopePackage;
            });

          // Can't `concat` because packages is `constant`
          packages.push(...scopePackages);
          break;
        case 'file':
          // without scope

          packageVersion = getVersionFromFileName(packageOrScopeName, packageOrScope.name);
          const p: Package = {
            name: packageOrScopeName,
            fullFileName: packageOrScope.name,
            fullPackageName: `${packageOrScopeName}@${packageVersion}`,
            path: packageOrScope.path,
            version: packageVersion,
          };
          packages.push(p);

          logger.debug('New package found', p);
          break;
      }
    });
  });

  return packages;
};

export default storageExplorer;
