dotenv.config();
import dotenv from "dotenv";
import { z } from "zod";

const envSchema = z.object({
    MONGO_URI: z.string().min(1, "MONGO_URI is required"),
    PORT: z.coerce.number().int().positive().default(5000),
});

export const env = envSchema.parse(process.env);