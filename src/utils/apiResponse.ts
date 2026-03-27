export class ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    meta?: {
        page: number;
        limit: number;
        totalDocs: number;
        totalPages: number;
    };

    constructor(message: string, data?: T, meta?: any) {
        this.success = true;
        this.message = message;
        this.data = data;
        if (meta) this.meta = meta;
    }
}