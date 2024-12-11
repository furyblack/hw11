import {CreateNewPostType, UpdatePostType} from "../types/posts/input";
import {PostMongoDbType, PostOutputType} from "../types/posts/output";
import {ObjectId, WithId} from "mongodb";
import {PostModel} from "../db/posts-model";

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
        return await PostRepository.createPost(postParams)
    }

    static async  updatePost(postId: string,  updateData:UpdatePostType): Promise<boolean | null>{
        return  await PostRepository.updatePost(postId, updateData)
    }

    static async deletePost(id: string): Promise<boolean>{
        return await PostRepository.deletePost(id)
    }

    static async findPostById(postId:string):Promise<WithId<PostMongoDbType>|null>{
        return PostModel.findOne({_id: new ObjectId(postId)})
    }
}


