// Spins up an in-memory MongoDB instance once for the entire test run so
// tests never touch a real Atlas cluster. The connection URI is stashed on
// `process.env.MONGODB_URI` and also written to a temp file so
// globalTeardown (a separate process context in Jest) can stop the same
// instance afterward.

import { MongoMemoryServer } from 'mongodb-memory-server';
import fs from 'fs';
import path from 'path';

const GLOBAL_CONFIG_PATH = path.join(process.cwd(), 'tests', '.mongo-instance.json');

export default async function globalSetup() {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  process.env.MONGODB_URI = uri;
  process.env.NODE_ENV = 'test';

  global.__MONGOD__ = mongod;
  fs.writeFileSync(GLOBAL_CONFIG_PATH, JSON.stringify({ uri }));
}
