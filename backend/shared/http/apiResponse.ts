export interface ApiErrorItem {
    field?: string;
    code: string;
    message: string;
}

export interface ApiSuccessResponse<T> {
    success: true;
    data: T;
    timestamp: string;
}

export interface ApiErrorResponse {
    success: false;
    error: ApiErrorItem[];
    timestamp: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;