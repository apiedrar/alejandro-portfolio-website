// import { ZodError } from 'zod';

export enum errorCodes {
    NotFoundError = "NotFoundError",
    InvalidParam = "InvalidParam",
    ServerError = "ServerError",
}

export abstract class CustomError extends Error {
    abstract readonly statusCode: number;
    constructor(message: string, public readonly field?: string, public readonly errorCode?: string) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
    }
    abstract formatErrorMessage(): string;
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
/*
export class RequestValidationError extends CustomError {
    readonly statusCode = 400;

    constructor(private zodError: ZodError) {
        super('Invalid request parameters provided');
    }

    serializeErrors(): SerializedErrorResponse {
        return {
            errors: this.zodError.errors.map((issue) => ({
                message: issue.message,
                field: issue.path.join('.'),
            })),
        };
    }
}
*/