export class ApiResponse {
    success: boolean;
    message: string;
    data: any;
    meta?: any;

    constructor(message: string, data: any = null, meta: any = null) {
        this.success = true;
        this.message = message;
        this.data = data;

        if (meta) this.meta = meta;
    }
}