import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import productRoutes from "./routes/product.route.js";

dotenv.config(); // Loads environment variables from .env file

const app = express(); // Initializes express app
const PORT = process.env.PORT || 8888; // Port number

const corsOptions = { // Configures CORS options
    origin: function (origin, callback) { // Function to check allowed origins
        const allowedOrigins = ['https://localhost:3000', 'https://localhost:3001']; // List of allowed origins

        // Allow requests with no origin (Postman, mobile apps, etc.)
        if (!origin) return callback(null, true);

        // Check if the origin is allowed
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true); // Allow the request
        } else {
            callback(new Error('Not allowed by CORS')); // Deny the request
        }
    },
    credentials: true, // Allow cookies
    methods: ['GET', 'PATCH', 'POST', 'DELETE'], // Allow these HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'] // Allow these headers
};

app.use(express.json()); // Allows app to accept json data in req.body
app.use(cors(corsOptions)); // Configures CORS middleware

app.use("/api/products", productRoutes); // Routes for products

app.listen(PORT, () => {
    connectDB(); // Connects to MongoDB
    console.log(`Server started at http://localhost:${PORT}`); // Logs server start
});