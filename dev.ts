import fs from 'fs';
import path from 'path';
import { readVdf } from './index';

const vdfPath = path.resolve('examples', 'vdfs', 'appinfo_stripped.vdf');
const buffer = fs.readFileSync(vdfPath);

try {
  const appInfo = readVdf(buffer);
  fs.mkdirSync(path.resolve('out'), { recursive: true });
  fs.writeFileSync(path.resolve('out', new Date().getTime() + '.json'), JSON.stringify(appInfo, null, 2));
} catch (err) {
  console.error(err);
}