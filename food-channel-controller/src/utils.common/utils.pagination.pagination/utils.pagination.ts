

export class Pagination {
    page: number;
    limit: number;


    constructor(page: number, limit: number) {
        this.page = page;
        this.limit = limit;
    }


    /**
    * The offset for this pagination object. The offset determines what index (0 index) to start retrieving results from.
    *
    * @return the offset
    */
    public getOffset(): number {
        if (this.page < 1) { return 0; } else {
            return (this.page - 1) * this.limit;
        }
    }

     /**
     * The limit for this pagination object. The limit determines the maximum amount of results to return.
     *
     * @return the limit
     */
    public getLimit(): number {
        return typeof this.limit == 'string' ? parseInt(this.limit) : this.limit;
    }

}