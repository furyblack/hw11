import {CreateNewPostType, UpdatePostType} from "../types/posts/input";
import {PostMongoDbType, PostOutputType} from "../types/posts/output";
import {queryBlogRepo} from "../repositories/query-blog-repository";
import {PostDb, PostModel} from "../db/posts-model";
import {ObjectId} from "mongodb";
import {queryPostRepo} from "../repositories/query-post-repository";

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
export class PostService{

     async createPost(postParams: CreateNewPostType): Promise<PostOutputType | null>{
        const targetBlog = await queryBlogRepo.getById(postParams.blogId)
        if (!targetBlog){
            return null
        }
        const  newPost = new PostDb({
            _id: new ObjectId(),
            title: postParams.title,
            shortDescription: postParams.shortDescription,
            content: postParams.content,
            blogId: postParams.blogId,
            blogName: targetBlog.name,
        })
        const newPostToDb = new PostModel(newPost)
        await newPostToDb.save()
        return PostMapper.toDto({...newPost, _id:newPostToDb._id})

    }

     async  updatePost(postId: string,  updateData:UpdatePostType): Promise<boolean | null>{
        const post = await queryPostRepo.getById(postId)
        if(!post){
            return null
        }
        const updateResult = await PostModel.updateOne({_id: new ObjectId(postId)}, {$set:{...updateData}})
        const updatedCount = updateResult.modifiedCount
        return Boolean(updatedCount);

    }
     async deletePost(id: string): Promise<boolean>{
        try{
            const result = await PostModel.deleteOne({_id: new ObjectId(id)})
            return result.deletedCount === 1;
        }catch (error){
            console.error("Error deleting post", error)
            return false
        }
    }

}

export const postService = new PostService()
