import {PostOutputType} from "../types/posts/output";
import {PostRepository} from "../repositories/post-repository";
import {CreateNewPostType} from "../types/posts/input";
import {BlogRepository} from "../repositories/blog-repository";
import {CreateNewBlogType} from "../types/blogs/input";
import {BlogMongoDbType} from "../types/blogs/output";
import {QueryBlogRepository} from "../repositories/query-blog-repository";
import {PostDb} from "../db/posts-model";
import {ObjectId} from "mongodb";

export class BlogsService {

    static async createPostToBlog(data: CreateNewPostType) {
        const {title, shortDescription, content, blogId} = data
        // Создаем новый пост для конкретного блога
            //TODO переделать на конструктор ( смотри пример с блогами )
        const newPost: PostOutputType | null = await PostRepository.createPost({
            title,
            shortDescription,
            content,
            blogId,
        });
        // const newPost = new PostDb({
        //     _id: new ObjectId(),
        //     title: data.title,
        //     shortDescription: data.shortDescription,
        //     content: data.content,
        //     blogId: data.blogId,
        //     blogName: data.name,
        // })
        return newPost
    }

    //переносим часть функционала  с blog route ( создание блога)
    static async createBlog(data: CreateNewBlogType) {
        const newBlogData = new BlogMongoDbType(data)
        const newBlogId: string = await BlogRepository.createBlog(newBlogData)
        //TODO возвращшаем блог айди
        const  createdBlog = await QueryBlogRepository.getById(newBlogId)
        return createdBlog!
    }

    static async deleteBlog(id: string): Promise<boolean> {
        return await BlogRepository.deleteBlog(id)
    }

}



