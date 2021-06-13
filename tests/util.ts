export const setPlatform = (platform: string) => {
  Object.defineProperty(process, 'platform', {
    value: platform,
  });
};
