export class BlogOutputClass{
    constructor(
    public id: string,
    public name: string,
    public description: string,
    public websiteUrl: string,
    public isMembership: boolean,
    public createdAt: string
    ) {
    }
}

export type BlogOutputType =  {
    "id": string,
    "name": string,
    "description": string,
    "websiteUrl": string,
    "isMembership": boolean,
    "createdAt": string
}
export class BlogMongoDbType  {
    createdAt:Date
    constructor(
  public  name: string,
  public description: string,
  public websiteUrl: string,
    ) {
        this.createdAt = new Date()
    }
}

export type blogSortData = {
    pageSize: number,
    pageNumber: number,
    sortBy: string,
    sortDirection: string,
    searchNameTerm: string | null,
}

export type PaginationOutputType<I> = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount:  number,
    items: I
}