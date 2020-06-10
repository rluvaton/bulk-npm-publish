import 'jest-extended';
import * as mock from 'mock-fs';
import fileWriter from '../../src/file-writer';

describe('File Writer', () => {
  afterEach(() => {
    mock.restore();
  });

  it('should be defined', () => {
    expect(fileWriter).toBeDefined();
  });

  it('should write file to file system', async () => {
    mock({});

    const fs = require('fs');

    let filePath = './file.txt';
    let fileContent = 'some text';

    const fileWriterPr = fileWriter(filePath, fileContent);
    expect(fileWriterPr).toResolve();
    await fileWriterPr;
    const fsFileContent = fs.readFileSync(filePath, {encoding: 'utf8'});

    expect(fsFileContent).toEqual(fileContent);
  });

  it('should overwrite file to file system if exist', async () => {
    let fileName = 'file.txt';
    let filePath = `./${fileName}`;
    let prevFileContent = 'old';
    let fileContent = 'new';

    mock({
      [fileName]: prevFileContent
    });

    const fs = require('fs');

    let fsFileContent = fs.readFileSync(filePath, {encoding: 'utf8'});
    expect(fsFileContent).toEqual(prevFileContent);

    const fileWriterPr = fileWriter(filePath, fileContent);
    expect(fileWriterPr).toResolve();
    await fileWriterPr;
    fsFileContent = fs.readFileSync(filePath, {encoding: 'utf8'});
    expect(fsFileContent).toEqual(fileContent);
  });
});
