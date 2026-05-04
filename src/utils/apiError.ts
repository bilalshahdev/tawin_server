export class ApiError extends Error {
    statusCode: number;
    // Optional interpolation params, e.g. { amount: 100, product: 'Cement' }.
    // Consumed by the global error middleware when calling req.t(message, params).
    params?: Record<string, unknown>;

    constructor(statusCode: number, message: string, params?: Record<string, unknown>) {
        super(message);
        this.statusCode = statusCode;
        this.params = params;
    }
}
