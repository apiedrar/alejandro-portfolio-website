import { env } from "./config/env.config.js";
import express from "express";
import cors, { CorsOptions } from "cors";
import { connectDB } from "./config/db.config.js";
import productRoutes from "./features/products/product.routes.js";
import { errorHandler } from "./shared/errors/error.handler.js";

const app = express();
const PORT = env.PORT;
const corsOptions: CorsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = ['http://localhost:3000'];

        // Allow requests with no origin (Postman, mobile apps, etc.)
        if (!origin) return callback(null, true);

        // Check if the origin is allowed
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // Allow cookies
    methods: ['GET', 'PATCH', 'POST', 'DELETE'], // Allow these HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'] // Allow these headers
};

app.use(express.json());
app.use(cors(corsOptions));
app.use("/api/products", productRoutes);
app.use(errorHandler); // TS custom Error Middleware
app.listen(PORT, () => {
    connectDB();
    console.log(`Server started at http://localhost:${PORT} 🚀`);
});
