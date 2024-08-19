import {BlogModel} from "../db/db";
import {CreateNewBlogType, UpdateBlogType} from "../types/blogs/input";
import {BlogOutputType, BlogMongoDbType} from "../types/blogs/output";
import {ObjectId, WithId} from "mongodb";

export class BlogMapper {
    static toDto(blog: WithId<BlogMongoDbType>): BlogOutputType {
        return {
            id: blog._id.toString(),
            name: blog.name,
            description: blog.description,
            websiteUrl: blog.websiteUrl,
            isMembership: false,
            createdAt: blog.createdAt.toISOString()
        }
    }
}

export class BlogRepository {

    static async createBlog(blogParams: CreateNewBlogType): Promise<BlogOutputType> {
        const newBlog: BlogMongoDbType = {
            name: blogParams.name,
            description: blogParams.description,
            websiteUrl: blogParams.websiteUrl,
            createdAt: new Date()
        }

        const newBlogToDb = new BlogModel(newBlog)
        await newBlogToDb.save()
        return BlogMapper.toDto({...newBlog, _id: newBlogToDb._id})
    }

    static async updateBlog(blogId: string, updateData: UpdateBlogType): Promise<boolean> {

        const updateResult = await BlogModel.updateOne({_id: new ObjectId(blogId)}, {$set: {...updateData}})
        const updatedCount = updateResult.modifiedCount
        return !!updatedCount;

    }

    static async deleteBlog(id: string): Promise<boolean> {
        try {
            const result = await BlogModel.deleteOne({_id: new ObjectId(id)}); //было .deleteOne({_id: new ObjectId(id)});
            return result.deletedCount === 1;
        } catch (error) {
            console.error("Error deleting blog:", error);
            return false;
        }
    }

}

