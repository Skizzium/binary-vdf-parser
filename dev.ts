import fs from 'fs';
import path from 'path';
import { readVdf } from './index';

const filepath = path.resolve('samples', 'appinfo.vdf');
const dumppath = path.resolve('out', path.basename(filepath).split('.').slice(0, -1) + '.json');

try {
  const buffer = fs.readFileSync(filepath);
  const appInfo = readVdf(buffer);
  fs.mkdirSync(path.resolve('out'), { recursive: true });
  fs.writeFileSync(dumppath, JSON.stringify(appInfo, null, 2));
  console.log(`Wrote to ${dumppath}`);
} catch (err) {
  console.error(err);
}