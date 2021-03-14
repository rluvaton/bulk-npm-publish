import fetch from 'npm-registry-fetch';
import npmConfigReader from 'libnpmconfig';

export const getCurrentRegistry = (): string => {
  return npmConfigReader.read().get('registry') || 'https://registry.npmjs.org/';
};

export const pingNpmRegistry = async (registry?: string): Promise<boolean> => {
  // Taken from https://github.com/npm/cli/blob/latest/lib/utils/ping.js

  try {
    const res = await fetch('/-/ping?write=true', {registry});
    await res.json();
  } catch (err) {
    return false;
  }

  return true;
};

export const isNpmPackagePublished = async ({scope, name, version, registry}: { scope?: string, name: string, version: string, registry?: string }): Promise<boolean> => {
  if (!name || !version) {
    throw new Error('name and/or version is required!');
  }

  if (!registry) {
    // Don't use cache as it can be changed between runs
    registry = getCurrentRegistry();
  }

  if (version === 'latest') {
    throw new Error(`Validate if npm package is published doesn't support 'latest' as the version`);
  }

  try {
    // We dont use GET {name}/{version} endpoint as it not supported in some registries (like SonaType Nexus Registry)
    // And we use HEAD method because we only want to know the existence of the package version
    await fetch(getTarballEndpointFromPackageInfo({scope, name, version}), {registry, method: 'HEAD'});
  } catch (err) {
    return false;
  }

  return true;
};

/**
 * Get tarball endpoint from package information
 * @param scope Package Scope (if exists)
 * @param name Package name
 * @param version Package version (latest is not supported!)
 * @return The tarball endpoint for the provided package
 *
 * @example Without Scope
 * getTarballEndpointFromPackageInfo({
 *   name: 'is',
 *   version: '3.3.0'
 * }) === 'is/-/is-3.3.0.tgz'
 *
 * @example With Scope
 * getTarballEndpointFromPackageInfo({
 *   scope: 'jest',
 *   name: 'core',
 *   version: '26.6.3'
 * }) === '@jest/core/-/core-26.6.3.tgz'
 *
 */
const getTarballEndpointFromPackageInfo = ({scope, name, version}: { scope?: string, name: string, version: string }): string => {
  let tarballEndpoint: string = '';

  if (scope) {
    tarballEndpoint = `@${scope}/`;
  }

  tarballEndpoint += `${name}/-/${name}-${version}.tgz`;

  return tarballEndpoint;
};
