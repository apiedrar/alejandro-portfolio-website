import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";

// Integration-test helper (SPEC decision 24): a real in-process single-node replica set. A standalone
// mongod cannot run multi-document transactions, and the order write path needs them.
// Each test file that calls startMongo() gets its own isolated instance.

// First start can be slow (process spawn + replica-set election); Jest's 5 s default would kill it.
export const STARTUP_TIMEOUT_MS = 60_000;

let replSet: MongoMemoryReplSet | undefined;

export async function startMongo(): Promise<void> {
    replSet = await MongoMemoryReplSet.create({ replSet: { count: 1, storageEngine: "wiredTiger" } });
    await mongoose.connect(replSet.getUri());
    // Build declared indexes (unique, TTL) up front so tests never race index creation.
    await Promise.all(Object.values(mongoose.models).map((model) => model.init()));
}

// Empties every collection but keeps indexes, unlike dropDatabase().
export async function clearDatabase(): Promise<void> {
    await Promise.all(Object.values(mongoose.connection.collections).map((collection) => collection.deleteMany({})));
}

export async function stopMongo(): Promise<void> {
    await mongoose.disconnect();
    await replSet?.stop();
    replSet = undefined;
}
