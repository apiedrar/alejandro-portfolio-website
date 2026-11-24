import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import mongoose from "mongoose";
import { startMongo, stopMongo, clearDatabase, STARTUP_TIMEOUT_MS } from "./mongo.harness.js";

const Thing = mongoose.model("HarnessThing", new mongoose.Schema({ name: String }));

describe("mongo harness (real replica set)", () => {
    beforeAll(startMongo, STARTUP_TIMEOUT_MS);
    afterAll(stopMongo, STARTUP_TIMEOUT_MS);
    beforeEach(clearDatabase);

    it("commits a multi-document transaction", async () => {
        const session = await mongoose.startSession();
        try {
            await session.withTransaction(async () => {
                // With a session, Mongoose only accepts several documents when `ordered: true`.
                await Thing.create([{ name: "a" }, { name: "b" }], { session, ordered: true });
            });
        } finally {
            await session.endSession();
        }

        expect(await Thing.countDocuments()).toBe(2);
    });

    it("rolls back every write when the transaction callback throws", async () => {
        const session = await mongoose.startSession();
        try {
            await expect(
                session.withTransaction(async () => {
                    await Thing.create([{ name: "a" }], { session });
                    throw new Error("boom");
                }),
            ).rejects.toThrow("boom");
        } finally {
            await session.endSession();
        }

        expect(await Thing.countDocuments()).toBe(0);
    });
});
