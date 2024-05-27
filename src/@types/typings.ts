interface PaginationInput {
    page?: number;
    limit?: number;
}

interface PaginationPayload {
    totalDocs: number;
    limit: number;
    totalPages: number;
    page?: number | null;
    pagingCounter: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
    prevPage?: number | null;
    nextPage?: number | null;
}
