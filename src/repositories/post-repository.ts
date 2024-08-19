import {PostModel} from "../db/db";
import {CreateNewPostType, UpdatePostType} from "../types/posts/input";
import {PostMongoDbType, PostOutputType} from "../types/posts/output";
import {QueryPostRepository} from "./query-post-repository";
import {QueryBlogRepository} from "./query-blog-repository";
import {ObjectId, WithId} from "mongodb";

export class PostMapper{
    static toDto(post:PostMongoDbType):PostOutputType{
        return {
            id: post._id.toString(),
            title: post.title,
            shortDescription: post.shortDescription,
            content: post.content,
            blogId: post.blogId,
            blogName: post.blogName,
            createdAt: post.createdAt.toISOString()
        }
    }
}

export class PostRepository{
    static async createPost(postParams: CreateNewPostType): Promise<PostOutputType | null>{
        const targetBlog = await QueryBlogRepository.getById(postParams.blogId)
        if (!targetBlog){
            return null
        }
        const newPost:PostMongoDbType ={
            _id: new ObjectId(),//crypto.randomUUID(),  //new ObjectId()//crypto.randomUUID(),
            title: postParams.title,
            shortDescription: postParams.shortDescription,
            content: postParams.content,
            blogId: postParams.blogId,
            blogName: targetBlog.name,
            createdAt: new Date()
        } as unknown as PostMongoDbType

        const newPostToDb = new PostModel(newPost)
        await newPostToDb.save()
        return PostMapper.toDto({...newPost, _id:newPostToDb._id})
    }

    static async  updatePost(postId: string,  updateData:UpdatePostType): Promise<boolean | null>{
       const post = await QueryPostRepository.getById(postId)
        if(!post){
            return null
        }
        const updateResult = await PostModel.updateOne({_id: new ObjectId(postId)}, {$set:{...updateData}})
        const updatedCount = updateResult.modifiedCount
        return Boolean(updatedCount);

    }

    static async deletePost(id: string): Promise<boolean>{
        try{
            const result = await PostModel.deleteOne({_id: new ObjectId(id)})
            return result.deletedCount === 1;
        }catch (error){
            console.error("Error deleting post", error)
            return false
        }

    }

    static async findPostById(postId:string):Promise<WithId<PostMongoDbType>|null>{
        return PostModel.findOne({_id: new ObjectId(postId)})
    }
}
