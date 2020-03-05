import * as dirTree from 'directory-tree';

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
 *   fullName: 'core-5.0.0.tgz',
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
   * @example for package `@jest/core@5.0.0` the full name is **`core-5.0.0.tgz`**
   */
  fullName: string;

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

  if (fullPackageName.endsWith('.tgz')) {
    fullPackageName = fullPackageName.substring(
      0,
      fullPackageName.length - '.tgz'.length
    );
  }

  return fullPackageName;
}

const storageExplorer = (dir: string): Package[] => {
  const packages: Package[] = [];

  // Get all folder in dir
  // Get all tgz files in the subdirectory
  const filteredTree = dirTree(dir, {
    extensions: /\.tgz/,
    normalizePath: true
  });

  const storageFolders = filteredTree.children;

  storageFolders.forEach(packagesFolders => {
    const packageOrScopeName: string = packagesFolders.name;

    packagesFolders.children.forEach(packageOrScope => {
      switch (packageOrScope.type) {
        case 'directory':
          // Meaning it's a scope
          const packageName = packageOrScope.name;

          const scopePackages = packageOrScope.children
            // Fix #9 (adding none `tgz` file to the script)
            .filter(
              packageInScope =>
                packageInScope.type === 'file' &&
                packageInScope.extension === '.tgz'
            )
            .map(packageInScope => {
              return {
                name: packageName,
                fullName: packageInScope.name,
                path: packageInScope.path,
                version: getVersionFromFileName(
                  packageName,
                  packageInScope.name
                ),
                scope: packageOrScopeName
              };
            });

          // Can't `concat` because packages is `constant`
          packages.push(...scopePackages);
          break;
        case 'file':
          // without scope
          packages.push({
            name: packageOrScopeName,
            fullName: packageOrScope.name,
            path: packageOrScope.path,
            version: getVersionFromFileName(
              packageOrScopeName,
              packageOrScope.name
            )
          });
          break;
      }
    });
  });

  return packages;
};

export default storageExplorer;
