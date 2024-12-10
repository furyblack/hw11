import {CreateNewBlogType} from "./input";

export type BlogOutputType =  {
    "id": string,
    "name": string,
    "description": string,
    "websiteUrl": string,
    "isMembership": boolean,
    "createdAt": string
}

//TODO переименовать в BlogDB
export  class  BlogMongoDbType{
    public name: string
    public description: string
    public websiteUrl: string
    public createdAt: Date

    constructor(data:CreateNewBlogType) {
        this.name = data.name
        this.description = data.description
        this.websiteUrl = data.websiteUrl
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