import fs from 'fs';
import path from 'path';

const GLOBAL_CONFIG_PATH = path.join(process.cwd(), 'tests', '.mongo-instance.json');

export default async function globalTeardown() {
  if (global.__MONGOD__) {
    await global.__MONGOD__.stop();
  }
  if (fs.existsSync(GLOBAL_CONFIG_PATH)) {
    fs.unlinkSync(GLOBAL_CONFIG_PATH);
  }
}
