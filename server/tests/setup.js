// Per-test-file DB connection lifecycle. Imported at the top of every
// *.test.js file that needs a live Mongoose connection. Uses the in-memory
// Mongo URI that globalSetup.js already placed on process.env.MONGODB_URI.

import mongoose from 'mongoose';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI);
  }
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.close();
});
