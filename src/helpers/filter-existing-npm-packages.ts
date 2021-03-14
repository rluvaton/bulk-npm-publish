import {Package} from '../storage-explorer';
import {getCurrentRegistry, isNpmPackagePublished} from '../npm-utils';
import PromisePool from 'es6-promise-pool';
import {logger} from '../logger';

const generateIsPublishedPromises = function* (packages: Package[], registry: string | undefined): Generator<Promise<{ isPublished: boolean, package: Package }>> {
  const packagesLength = packages.length;
  for (let index = 0; index < packagesLength; index++) {
    yield isNpmPackagePublished({name: packages[index].name, version: packages[index].version, registry})
      .then((isPublished) => ({isPublished, package: packages[index]}));
  }
};

export const filterExistingNpmPackages = async (packages: Package[], registry: string | undefined): Promise<Package[]> => {
  const unpublishedPackages: Package[] = [];

  if (!registry) {
    registry = getCurrentRegistry();
  }

  const promiseIterator = generateIsPublishedPromises(packages, registry);
  // @ts-ignore
  const pool = new PromisePool<{ isPublished: boolean, package: Package }>(promiseIterator, 5);

  // @ts-ignore
  pool.addEventListener('rejected', (event: { data: { error: any } }) => {
    logger.error('Failed to check if npm package is published', event?.data?.error);
  });

  // @ts-ignore
  pool.addEventListener('fulfilled', (event:{ data: { result: { isPublished: boolean, package: Package }}}) => {
    const {isPublished, package: _package} = event?.data?.result;
    if (!isPublished) {
      unpublishedPackages.push(_package);
    }
  });

  await pool.start();

  return unpublishedPackages;
};
