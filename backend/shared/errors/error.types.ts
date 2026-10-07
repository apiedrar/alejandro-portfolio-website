import { type Response } from "express";
import type { ApiErrorResponse, ApiErrorItem } from "../http/http.response.js";

export enum errorCodes {
    NotFoundError = "NotFoundError",
    InvalidParam = "InvalidParam",
    ServerError = "ServerError",
}

export abstract class CustomError extends Error {
    // Per subclass invariant value
    protected abstract statusCode: number;


    constructor(message: string, protected field?: string, protected errorCode?: string) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
    }

    // Abstract method: subclasses decide how to deliver the message
    protected abstract formatErrorMessage(): string;
    
    // Concrete method: shared construction logic inherited by all subclasses
    private toErrorItem(): ApiErrorItem {
        return {
            field: this.field,
            code: this.errorCode!,
            message: this.formatErrorMessage(),
        }
    }

    // Concrete method: shared construction logic inherited by all subclasses
    private toErrorResponse(): ApiErrorResponse {
        return {
            success: false,
            error: [this.toErrorItem()],
            timestamp: new Date().toISOString(),
        }
    }

    // Concrete method: shared construction logic inherited by all subclasses
    respondWith(res: Response<ApiErrorResponse>): void {
        res.status(this.statusCode).json(this.toErrorResponse());
    }
}

export class NotFoundError extends CustomError {
    readonly statusCode = 404;

    constructor(message: string, field?: string, errorCode: string = errorCodes.NotFoundError) {
        super(message, field, errorCode);
    }

    formatErrorMessage() {
        return `${this.field} not found: ${this.message}`;
    }

}

export class ValidationError extends CustomError {
    readonly statusCode = 400;

    constructor(message: string, field?: string, errorCode: string = errorCodes.InvalidParam) {
        super(message, field, errorCode);
    }

    formatErrorMessage() {
        return `Invalid ${this.field}: ${this.message}`;
    }

}