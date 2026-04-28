import fs from 'fs';
import path from 'path';
import os from 'os';
import { resetStores } from '../../src/data';

let tmpDir: string;

export function setupTestData(): void {
  beforeAll(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bookshelf-test-'));
    const srcData = path.resolve(__dirname, '../../../../data');
    for (const file of ['books.json', 'shelves.json', 'reviews.json']) {
      fs.copyFileSync(path.join(srcData, file), path.join(tmpDir, file));
    }
    process.env['DATA_DIR'] = tmpDir;
    resetStores();
  });

  afterAll(() => {
    fs.rmSync(tmpDir, { recursive: true });
    delete process.env['DATA_DIR'];
    resetStores();
  });
}
