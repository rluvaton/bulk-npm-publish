import { Package } from '../storage-explorer';
import { getCurrentRegistry, isNpmPackagePublished } from '../utils/npm';
import PromisePool from 'es6-promise-pool';
import { logger } from '../logger';

const generateIsPublishedPromises = function* (
  packages: Package[],
  registry: string | undefined,
): Generator<Promise<{ isPublished: boolean; package: Package }>> {
  const packagesLength = packages.length;
  for (let index = 0; index < packagesLength; index++) {
    const currentPackage = packages[index];
    yield isNpmPackagePublished({
      scope: currentPackage.scope,
      name: currentPackage.name,
      version: currentPackage.version,
      registry,
    }).then((isPublished) => ({ isPublished, package: currentPackage }));
  }
};

export const filterExistingNpmPackages = async (packages: Package[], registry?: string): Promise<Package[]> => {
  const unpublishedPackages: Package[] = [];

  if (!registry) {
    registry = getCurrentRegistry();
  }

  const promiseIterator = generateIsPublishedPromises(packages, registry);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const pool = new PromisePool<{ isPublished: boolean; package: Package }>(promiseIterator, 5);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  pool.addEventListener('rejected', (event: { data: { error: any } }) => {
    logger.error('Failed to check if npm package is published', event?.data?.error);
  });

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  pool.addEventListener('fulfilled', (event: { data: { result: { isPublished: boolean; package: Package } } }) => {
    const { isPublished, package: _package } = event?.data?.result;
    if (!isPublished) {
      unpublishedPackages.push(_package);
    }
  });

  await pool.start();

  return unpublishedPackages;
};
