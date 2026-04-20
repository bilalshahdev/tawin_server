export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        page: number;
        limit: number;
        totalDocs: number;
        totalPages: number;
    } | null;
}