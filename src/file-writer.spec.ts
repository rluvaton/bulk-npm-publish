import 'jest-extended';
import {fs, vol} from 'memfs';

jest.mock('fs', () => fs);
import fileWriter from './file-writer';

describe('File Writer', () => {
  const mockFs = (fakeFsStructure) => vol.fromNestedJSON(fakeFsStructure, '/');

  afterEach(() => {
    vol.reset();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(fileWriter).toBeDefined();
  });

  it('should write file to file system', async () => {
    mockFs({});

    expect(vol.toJSON()).toEqual({});

    const filePath = '/file.txt';
    const fileContent = 'some text';

    await expect(fileWriter(filePath, fileContent)).toResolve();

    expect(vol.toJSON()).toEqual({
      [filePath]: fileContent
    });
  });

  it('should overwrite file to file system if exist', async () => {
    const fileName = 'file.txt';
    const filePath = `/${fileName}`;
    const prevFileContent = 'old';
    const fileContent = 'new';

    mockFs({
      [filePath]: prevFileContent
    });

    await expect(fileWriter(filePath, fileContent)).toResolve();

    expect(vol.toJSON()).toEqual({
      [filePath]: fileContent
    });
  });
});
