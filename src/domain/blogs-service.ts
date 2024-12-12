import {BlogRepository} from "../repositories/blog-repository";
import {CreateNewBlogType} from "../types/blogs/input";
import {QueryBlogRepository} from "../repositories/query-blog-repository";
import {BlogDb} from "../db/blogs-model";

export class BlogsService {

    //переносим часть функционала  с blog route ( создание блога)
    static async createBlog(data: CreateNewBlogType) {
        const newBlogData = new BlogDb(data)
        const newBlogId: string = await BlogRepository.createBlog(newBlogData)
        const  createdBlog = await QueryBlogRepository.getById(newBlogId)
        return createdBlog!
    }

    static async deleteBlog(id: string): Promise<boolean> {
        return await BlogRepository.deleteBlog(id)
    }
}



