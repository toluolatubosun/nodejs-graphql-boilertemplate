interface PaginationInput {
    next?: string;
    limit?: number;
}

interface PaginationPayload {
    total: number;
    hasNext: boolean;
    next: string | null;
}
