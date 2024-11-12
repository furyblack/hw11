import {PostOutputType} from "../types/posts/output";
import {PostRepository} from "../repositories/post-repository";
import {CreateNewPostType} from "../types/posts/input";
import {BlogRepository} from "../repositories/blog-repository";
import {CreateNewBlogType} from "../types/blogs/input";
import {BlogMongoDbType} from "../types/blogs/output";
import {QueryBlogRepository} from "../repositories/query-blog-repository";

export class BlogsService {

    static async createPostToBlog(data: CreateNewPostType) {
        const {title, shortDescription, content, blogId} = data
        // Создаем новый пост для конкретного блога
        const newPost: PostOutputType | null = await PostRepository.createPost({
            title,
            shortDescription,
            content,
            blogId,
        });
        return newPost
    }

    //переносим часть функционала  с blog route ( создание блога)
    static async createBlog(data: CreateNewBlogType) {
        const {name, description, websiteUrl} = data

        const newBlogData = new BlogMongoDbType(name,description,websiteUrl)

        const newBlogId: string = await BlogRepository.createBlog(newBlogData)
        const  createdBlog = await QueryBlogRepository.getById(newBlogId)
        return createdBlog!
    }

    static async deleteBlog(id: string): Promise<boolean> {
        return await BlogRepository.deleteBlog(id)
    }

}



