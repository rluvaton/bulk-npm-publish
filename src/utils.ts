import * as lodashDeepClone from 'lodash.clonedeep';
import {platform} from 'process';
let packageJson;

export function deepClone<T = any>(val: T): T {
  return lodashDeepClone(val);
}

export enum OSTypes {
  LINUX = 'linux',
  WINDOWS = 'windows'
}

export const getCurrentOS = (): OSTypes | undefined => {
  switch (platform) {
    case 'win32':
      return OSTypes.WINDOWS;
    case 'aix':
    case 'darwin':
    case 'freebsd':
    case 'openbsd':
    case 'sunos':
    case 'linux':
      return OSTypes.LINUX;
    default:
      return undefined;
  }
};

export const getPackageName = () => {
  if (!packageJson) {
    packageJson = require('../package.json');
  }

  return packageJson.name;
};

export const removeEmpty = (obj: object, shouldRemoveFn: (value) => boolean = (value) => value === undefined) =>
  Object.keys(obj).forEach(key => shouldRemoveFn(obj[key]) && delete obj[key]);
