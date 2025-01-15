export default class PaginatedResultsDTO {
    results: any[];
    count: number;
    totalPages: number;

    constructor(results: any[], count: number, totalPages: number) {
        this.results = results;
        this.count = count;
        this.totalPages = totalPages;
    }
}