import {blogRepo} from "../repositories/blog-repository";
import {CreateNewBlogType} from "../types/blogs/input";
import {queryBlogRepo} from "../repositories/query-blog-repository";
import {BlogDb} from "../db/blogs-model";

export class BlogsService {

    //переносим часть функционала  с blog route ( создание блога)
     async createBlog(data: CreateNewBlogType) {
        const newBlogData = new BlogDb(data)
        const newBlogId: string = await blogRepo.createBlog(newBlogData)
        const  createdBlog = await queryBlogRepo.getById(newBlogId)
        return createdBlog!
    }

     async deleteBlog(id: string): Promise<boolean> {
        return await blogRepo.deleteBlog(id)
    }
}

export const blogService = new BlogsService()



