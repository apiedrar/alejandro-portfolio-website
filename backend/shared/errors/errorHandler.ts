import { type Request, type Response, type NextFunction } from "express";
import { ApiResponse, ApiErrorResponse } from "../http/apiResponse.js";
import { CustomError, errorCodes } from "./errorTypes.js";
import mongoose from "mongoose";

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response<ApiResponse<ApiErrorResponse>>,
    next: NextFunction,
): void => {

    if (res.headersSent) {
        next(err);
        return;
    }

    // Operational error thrown on purpose
    if (err instanceof CustomError) {

        err.respondWith(res);
        return;

    } else if (err instanceof mongoose.Error.ValidationError) {

        const errorMessages = Object.values(err.errors).map(fieldErr => ({
            field: fieldErr.path,
            code: fieldErr.kind,
            message: fieldErr.message
        }));

        res.status(400).json({ success: false, error: errorMessages, timestamp: new Date().toISOString() });
        return;

    } else {
        
        // Production logger (Integration boundary for Winston)
        // Log complete unhandled bug stack trace internally
        console.error(`Logged unhandled ${err.name} at ${req.baseUrl}${req.url} due to ${err.cause}: ${err.stack}`);
        
        // Fallback response so the client isn't left hanging
        res.status(500).json({ success: false, error: [{ code: errorCodes.ServerError, message: "Something went wrong on our end"}], timestamp: new Date().toISOString() });
        return;

    }
}