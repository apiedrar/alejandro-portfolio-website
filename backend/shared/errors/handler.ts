import { type Request, type Response, type NextFunction } from "express";
import { CustomError, errorCodes } from "./types.js";
import mongoose from "mongoose";

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction,
): void => {
    if (res.headersSent) {
        next(err);
        return;
    }
    // Operational error thrown on purpose
    if (err instanceof CustomError) {
        res.status(err.statusCode).json({ success: false, error: [{ field: err.field, code: err.errorCode, message: err.formatErrorMessage() }] });
        return;
    }
    else if (err instanceof mongoose.Error.ValidationError) {
        const errorMessages = Object.values(err.errors).map(fieldErr => ({
            field: fieldErr.path,
            code: fieldErr.kind,
            message: fieldErr.message
        }));
        res.status(400).json({ success: false, error: errorMessages });
        return;
    }
    // Production logger (Integration boundary for Winston)
    console.error(`Logged unhandled ${err.name} at ${req.baseUrl}${req.url} due to ${err.cause}: ${err.stack}`);
    // Log complete unhandled bug stack trace internally
    // Fallback response so the client isn't left hanging
    res.status(500).json({ success: false, error: [{ code: errorCodes.ServerError, message: "Something went wrong on our end"}] });
}