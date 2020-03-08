import * as lodashDeepClone from 'lodash.clonedeep';

export function deepClone<T = any>(val: T): T {
  return lodashDeepClone(val);
}
